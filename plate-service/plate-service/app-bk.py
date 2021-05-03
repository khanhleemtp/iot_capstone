from flask import Flask
import os
from flask import Flask, flash, request, redirect, url_for
from werkzeug.utils import secure_filename
import cv2
from class_CNN import NeuralNetwork
from class_PlateDetection import PlateDetector

# Load pretrained model
########### INIT ###########
# Initialize the plate detector
plateDetector = PlateDetector(type_of_plate='RECT_PLATE',
                                        minPlateArea=4500,
                                        maxPlateArea=30000)

# Initialize the Neural Network
myNetwork = NeuralNetwork(modelFile="model/binary_128_0.50_ver3.pb",
                            labelFile="model/binary_128_0.50_labels_ver2.txt")


UPLOAD_FOLDER = os.path.dirname(os.path.realpath(__file__)) + '/uploads'
print(UPLOAD_FOLDER)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def hello_world():
    return 'Plate recognition service'

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/detect', methods=['POST'])
def upload_file():
    # check if the post request has the file part
    if 'file' not in request.files:
        return ''
    file = request.files['file']
    # if user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return ''
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        img = cv2.imread(os.path.join(app.config['UPLOAD_FOLDER'], filename))

        possible_plates = plateDetector.find_possible_plates(img)
        if possible_plates is not None:
            for i, p in enumerate(possible_plates):
                chars_on_plate = plateDetector.char_on_plate[i]
                recognized_plate, _ = myNetwork.label_image_list(chars_on_plate, imageSizeOuput=128)
                return recognized_plate
                
    return ''

if __name__ == "__main__":
    app.run(host='0.0.0.0')