FROM node:10.16-slim

WORKDIR /automations/

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build
EXPOSE 4000
ENTRYPOINT ["node", "dist"]
