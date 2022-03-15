# FROM golang:1.14.2

# WORKDIR /elkSyncer/

# ENV GOPATH=/elkSyncer
# ENV PATH="/elkSyncer/build/linux-amd64:$PATH"

# # Update
# RUN apt-get update \
#  && apt-get install -y vim \
#  && apt-get install -y go-dep unzip \
#  # monstache
#  && wget -q --show-progress https://github.com/rwynn/monstache/releases/download/v6.7.0/monstache-dfba1c2.zip \
#  && unzip monstache-dfba1c2.zip \
#  && rm monstache-dfba1c2.zip \
#  && mkdir bin && mkdir src \
#  && rm -rf /var/lib/apt/lists/*

# COPY . .

# RUN cd src/syncer \
#  && go get github.com/joho/godotenv \
#  && dep ensure

# CMD ["go", "run", "src/syncer/main.go"]

FROM python:3.7.9-alpine
WORKDIR /elkSyncer/
RUN pip install mongo-connector==2.3.0 \
    && pip install elasticsearch==7.5.1 \
    && pip install elastic2-doc-manager==1.0.0 \
    && pip install python-dotenv==0.11.0 \
    && pip install certifi==0.0.8 \
    && pip install pymongo==2.9 \
    && apk add --no-cache tzdata
COPY mongo-connector-config.json main.py ./
ENTRYPOINT ["python3", "main.py"]
