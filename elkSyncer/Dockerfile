FROM python:3.7.9-alpine

WORKDIR /elkSyncer/

RUN pip install mongo-connector==3.1.1 \
    && pip install elasticsearch==7.5.1 \
    && pip install elastic2-doc-manager==1.0.0 \
    && pip install python-dotenv==0.11.0 \
    && pip install certifi==0.0.8 \
    && apk add --no-cache tzdata

COPY mongo-connector-config.json main.py ./

ENTRYPOINT ["python3", "main.py"]
