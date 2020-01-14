FROM erxes/runner
WORKDIR /erxes-widgets
COPY yarn.lock package.json ./
RUN yarn install
CMD ["yarn", "dev"]
