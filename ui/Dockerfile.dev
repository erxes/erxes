FROM node:alpine
WORKDIR /erxes
COPY yarn.lock package.json ./
RUN yarn install
CMD ["yarn", "start"]