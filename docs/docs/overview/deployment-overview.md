---
id: deployment-overview
title: Deployment Overview
---

This document details the steps to perform the Erxes installation.

## Installing erxes

Modern server architectures and configurations are managed in many different ways. Some people still put new software somewhere in `opt` manually for each server while others have already jumped on the configuration management train and fully automated reproducible setups.

Erxes can be installed in many different ways so you can pick whatever works best for you.

We recommend to start with the [docker images](installation/docker.md) for the fastest way to get started and then pick one of the other, more flexible installation methods to build an easier to scale setup.

### Choose an installation method

- [Ubuntu](installation/ubuntu.md)
- [Debian 10](installation/debian10.md)
- [CentOS 8](installation/centos8.md)
- [RHEL 8](installation/redhat8.md)
- [Docker](installation/docker.md)
- [Heroku](installation/heroku.md)
- [AWS Marketplace](installation/aws.md)
- [DigitalOcean Marketplace](installation/digitalocean.md)

## Prerequisites

- MongoDB 3.6+
- Redis 3.x+
