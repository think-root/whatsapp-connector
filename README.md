# What's up?

This project is part of the [content-maestro](https://github.com/think-root/content-maestro) repository. If you want WhatsApp integration and automatic publishing of posts there as well, you need to deploy this app.

> [!WARNING]
> This integration relies on unofficial WhatsApp APIs and may lead to a permanent ban of the account. Proceed only if you fully accept that risk.

## Description

The app runs an Express.js server that shares a single WhatsApp session via HTTP endpoints. It authenticates requests using a shared bearer token, exposes utilities for updating the WhatsApp status, and sends individual or channel messages. When the service starts, it prints a QR code to the console that must be scanned with the WhatsApp account that will own the session.

## Prerequisites

- Node.js 20+

## Setup

1. **Clone the repository**

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create a `.env` file in the project root with the required variables**

   ```properties
   AUTH_TOKEN=your_shared_bearer_token
   PORT=3000
   ```

   Leaving `PORT` empty defaults the server to port `3000`.

4. **Run the server**

   ```bash
   npm start
   ```

   The first launch displays a QR code in the console—scan it with the WhatsApp account you plan to automate.

## API

All endpoints live under the same bearer-protected server and return JSON payloads.

### Authentication

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `Authorization` | string | Yes | `Bearer <AUTH_TOKEN>` value from `.env` |

**Error Response (401 Unauthorized):**

```json
{
  "success": false,
  "error": "Invalid or missing bearer token"
}
```

---

### POST `/wapp/update-status`

Updates the WhatsApp account status text.

#### Request

**Content-Type:** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | The new status message to publish |

#### Responses

**Success (200 OK):**

```json
{
  "success": true,
  "message": "Status updated successfully"
}
```

**Error (400 Bad Request):**

```json
{
  "success": false,
  "error": "Status text is required"
}
```

#### Example

```bash
curl -X POST "http://localhost:3000/wapp/update-status" \
  -H "Authorization: Bearer your_auth_token" \
  -H "Content-Type: application/json" \
  -d '{"text": "Available now!"}'
```

---

### POST `/wapp/send-message`

Sends a message to a WhatsApp user chat or channel.

#### Request

**Content-Type:** `application/json`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | Either `chat` (direct message) or `channel` |
| `jid` | string | Yes | The recipient JID (e.g., `1234567890@s.whatsapp.net`) |
| `text` | string | Yes | Message body to send |

#### Responses

**Success (200 OK):**

```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

**Error (400 Bad Request):**

```json
{
  "success": false,
  "error": "Valid message type is required (chat or channel)"
}
```

```json
{
  "success": false,
  "error": "Both JID and text are required"
}
```

#### Example

```bash
curl -X POST "http://localhost:3000/wapp/send-message" \
  -H "Authorization: Bearer your_auth_token" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "chat",
    "jid": "1234567890@s.whatsapp.net",
    "text": "Hello from the API!"
  }'
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
