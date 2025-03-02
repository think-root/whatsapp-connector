# What's up?

This repository is part of the [content-alchemist](https://github.com/think-root/content-alchemist) repository. If you want to have whatsapp integration, and you are not afraid of losing your whatsapp account (because it is an unofficial integration), then you also need to deploy this app. This is essentially a wrapper around [Baileys](https://github.com/WhiskeySockets/Baileys/) that serves as an API server providing endpoints for WhatsApp automation.

## How to run

### Requirements

- [docker](https://docs.docker.com/engine/install/) or/and [docker-compose](https://docs.docker.com/compose/install/)

### Clone repo

```shell
git clone https://github.com/think-root/whatsapp-connector.git
```

### Config

Create a **.env** file in the app root directory

```properties
AUTH_TOKEN=<your bearer token>
PORT=<server port, 3000 if leave empty>
```

### Deploy

- build `docker build -t wapp:latest -f Dockerfile .`
- run `docker run --name wapp --restart always --env-file .env -e TZ=Europe/Kiev --network think-root-network wapp:latest`
- or via docker compose `docker compose up -d`
