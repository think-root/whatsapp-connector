# What's up?

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2020-brightgreen.svg)](https://nodejs.org/)
[![Maintenance](https://img.shields.io/maintenance/yes/2025)](https://github.com/think-root/whatsapp-connector)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)

This repository is part of the [content-maestro](https://github.com/think-root/content-maestro) project. If you want to have WhatsApp integration and are not concerned about potentially **losing your WhatsApp account** (as it is an unofficial integration), you also need to deploy this app. This is essentially a wrapper around [Baileys](https://github.com/WhiskeySockets/Baileys/) that serves as an API server providing endpoints for WhatsApp automation.

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

- build `docker build -t whatsapp-connector:latest -f Dockerfile .`
- run `docker run --name whatsapp-connector --restart always --env-file .env -e TZ=Europe/Kiev --network think-root-network whatsapp-connector:latest`
- or via docker compose `docker compose up -d`

### Authorization

When launching the app, you will see a QR code in the console that you need to scan with your phone.

## API

### Authentication

All API endpoints require authentication using a Bearer token. This token should match the `AUTH_TOKEN` value in your `.env` file.

Include the token in your requests by adding the following header:
```
Authorization: Bearer <your_auth_token>
```

### Endpoints

### Update WhatsApp Status

Updates your WhatsApp status message.

- **URL**: `/wapp/update-status`
- **Method**: `POST`
- **Auth required**: Yes (Bearer token)
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "text": "Your new status message"
}
```

#### Success Response
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "message": "Status updated successfully"
}
```

#### Error Response
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "success": false,
  "error": "Status text is required"
}
```

#### Example
```bash
curl -X POST \
  http://localhost:3000/wapp/update-status \
  -H 'Authorization: Bearer your_auth_token' \
  -H 'Content-Type: application/json' \
  -d '{"text": "Available now!"}'
```

### Send WhatsApp Message

Sends a message to a WhatsApp contact or channel.

- **URL**: `/wapp/send-message`
- **Method**: `POST`
- **Auth required**: Yes (Bearer token)
- **Content-Type**: `application/json`

#### Request Body
```json
{
  "type": "chat",  // "chat" or "channel"
  "jid": "1234567890@s.whatsapp.net",  // recipient's JID
  "text": "Your message content"
}
```

#### Success Response
- **Code**: 200 OK
- **Content**:
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

#### Error Responses
- **Code**: 400 Bad Request
- **Content**:
```json
{
  "success": false,
  "error": "Valid message type is required (chat or channel)"
}
```
or
```json
{
  "success": false,
  "error": "Both JID and text are required"
}
```

#### Example
```bash
curl -X POST \
  http://localhost:3000/wapp/send-message \
  -H 'Authorization: Bearer your_auth_token' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "chat",
    "jid": "1234567890@s.whatsapp.net",
    "text": "Hello from the API!"
  }'
```