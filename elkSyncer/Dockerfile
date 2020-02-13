FROM python:3

WORKDIR /elkSyncer/

RUN pip install mongo-connector \
    && pip install elasticsearch \
    && pip install elastic2-doc-manager \
    && pip install python-dotenv \
    && pip install elasticsearch

COPY . .

CMD ["python", "main.py"]