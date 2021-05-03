import os
import pika
import json
from PIL import Image
from io import StringIO
import base64
import requests

import cv2
from class_CNN import NeuralNetwork
from class_PlateDetection import PlateDetector

def detect(myNetwork, plateDetector, file_name):
    img = cv2.imread(file_name)
    img = cv2.resize(img, (1000, int(1000 * img.shape[0] / img.shape[1])))

    possible_plates = plateDetector.find_possible_plates(img)
    if possible_plates is not None:
        for i, p in enumerate(possible_plates):
            chars_on_plate = plateDetector.char_on_plate[i]
            recognized_plate, _ = myNetwork.label_image_list(chars_on_plate, imageSizeOuput=128)
            return recognized_plate
                
    return ''

def main():
    BROKER_HOST = 'rabbitmq'
    BROKER_USERNAME = 'guest'
    BROKER_PASSWORD = 'guest'
    BROKER_PORT = '5672' 
    BROKER_QUEUE = 'parking'

    connection = pika.BlockingConnection(pika.ConnectionParameters(host=BROKER_HOST, port=BROKER_PORT, credentials=pika.credentials.PlainCredentials(BROKER_USERNAME, BROKER_PASSWORD)))
    print("connection")
    # Load pretrained model
    ########### INIT ###########
    # Initialize the plate detector
    plateDetector = PlateDetector(type_of_plate='RECT_PLATE',
                                            minPlateArea=4500,
                                            maxPlateArea=30000)

    # Initialize the Neural Network
    myNetwork = NeuralNetwork(modelFile="model/binary_128_0.50_ver3.pb",
                                labelFile="model/binary_128_0.50_labels_ver2.txt")

    channel = connection.channel()

    channel.queue_declare(queue=BROKER_QUEUE, durable=True, auto_delete=False)

    def callback(ch, method, properties, body):
        data = json.loads(body.decode('utf-8'))
        session_type = data['type']
        session_time = data['time']
        image_str = data['image']
        jpg_original = base64.b64decode(image_str)
        
        uploaded_count = len(os.listdir('uploads'))
        file_name = 'uploads/' + str(uploaded_count + 1) + '.jpg'

        with open(file_name, 'wb') as f_output:
            f_output.write(jpg_original)

        plate_number = detect(myNetwork, plateDetector, file_name)
        if plate_number != '':
            detect_data = {
                'type': session_type,
                'time': session_time,
                'number': plate_number
            }
            print(detect_data)
            # url = 'http://localhost:5000'
            # requests.post(url, data = detect_data)
        else:
            print('Cannot detect plate number in ' + file_name)

    channel.basic_consume(queue=BROKER_QUEUE, on_message_callback=callback, auto_ack=True)

    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()


if __name__ == '__main__':
    main()
