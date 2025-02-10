# PubSub Service

## Description

Scalable pubsub microservice build with NestJS and Redis.

## Installation

After pulling the repository, run the following command to install the dependencies, and build the source code:

```bash
npm install
npm run build
```

Create a `.env` file for environment variables, or copy from `example.env` default values.

By default, the service instantiates with 6 replicas, so you can change the number of replicas in the `docker-compose.yml` file.

After all that, you can build the docker image and start services:

```bash
docker-compose up -d --build
```