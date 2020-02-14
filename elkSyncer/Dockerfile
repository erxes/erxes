FROM python:3.7.6-slim

WORKDIR /app/

RUN pip install mongo-connector==3.1.1 \
    && pip install elasticsearch==7.5.1 \
    && pip install elastic2-doc-manager==1.0.0 \
    && pip install python-dotenv==0.11.0

COPY . .

CMD ["python", "main.py"]
