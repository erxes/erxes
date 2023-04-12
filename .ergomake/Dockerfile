FROM node:16 AS builder

WORKDIR /erxes

COPY package.json .
COPY yarn.* .

COPY . .

RUN yarn install

WORKDIR /

FROM node:16-alpine AS runner

RUN npm install -g pm2

RUN yarn global add wait-port

WORKDIR /erxes

COPY --from=builder /erxes .
COPY ./.ergomake/configs.json /erxes/cli/configs.json

CMD sh -c 'wait-port mongo:27017 && \
           cd cli && \
           ./bin/erxes.js dev'
