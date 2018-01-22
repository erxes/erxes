FROM node:6-onbuild
RUN mkdir -p /usr/src/erxes
WORKDIR /usr/src/erxes
COPY package.json /usr/src/erxes/
RUN yarn install
COPY ../ /usr/src/erxes
EXPOSE 3000
CMD ["yarn", "start"]
