FROM node:12.16.3-slim
WORKDIR /dashboard
COPY yarn.lock package.json ./
RUN yarn install
EXPOSE 4300
CMD ["index.js"]

