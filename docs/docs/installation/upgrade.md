---
id: upgrade
title: Upgrade
sidebar_label: Upgrade
---

Following the steps in this document you can upgrade the system version.

## Upgrading from v0.9+ to the latest release vx.x.x

### Breaking Changes
- Since version `latest vx.x.x` Erxes started using RabbitMQ as message broker service. To update, please see example changes at docker [installation guide.](docker)
- Engage module is moved to [separate repository](https://github.com/erxes/erxes-engages-email-sender). Also docker [installation guide](docker) is updated to reflect related changes.

### Env changes
- erxes
    - `REACT_APP_INTEGRATIONS_API_URL` - is no longer used

- erxes-api
    - `ENGAGES_API_DOMAIN` - erxes-engages service endpoint
    - `RABBITMQ_HOST` - RabbitMQ connection uri

- erxes-widgets-api
    - `RABBITMQ_HOST` - RabbitMQ connection uri

- erxes-integrations
    - `RABBITMQ_HOST` - RabbitMQ connection uri

- erxes-engages
    - `PORT` - engages service running port
    - `NODE_ENV` - node environment
    - `DEBUG` - enable logging
    - `MAIN_API_DOMAIN` - erxes api url
    - `MONGO_URL` - MongoDB connection uri
    - `RABBITMQ_HOST` - RabbitMQ connection uri
