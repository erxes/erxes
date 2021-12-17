---
id: deployment-overview
title: Deployment Overview
---

This document details the steps to perform the Erxes installation.

## Installing erxes

Modern server architectures and configurations are managed in many different ways. Some people still put new software somewhere in `opt` manually for each server while others have already jumped on the configuration management train and fully automated reproducible setups.

Currently we offer three different installation methods to install Erxes so you can pick whatever works best for you.

We recommend to start with the [docker based](installation/docker.md) installation for the fastest way to get started and then pick one of the other, more flexible installation methods to build an easier to scale setup.

### Choose an installation method

- [Script based installation on linux based operation systems](installation/ubuntu-quickstart.mdx)
- [Step by step installation on linux based operation systems](installation/ubuntu-step-by-step.mdx)
- [Docker based installation on linux based operation systems ](installation/docker.md)

## Prerequisites

- MongoDB 4.0.x+
- Redis 3.x+
- RabbitMQ 3.8.x+
- Elasticsearch
- Docker / Docker-compose
- Nginx latest
