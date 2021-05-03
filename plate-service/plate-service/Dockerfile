FROM tensorflow/tensorflow:1.13.1-py3

COPY . .

RUN apt update && apt install -y libglib2.0-0 libsm6 libxext6 libxrender-dev

RUN pip install -r requirements.txt

CMD ["python", "-u", "app.py"]