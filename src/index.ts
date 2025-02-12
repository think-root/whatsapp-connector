import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { config } from "./config";
import { whatsAppService } from "./services/whatsapp";
import { errorHandler } from "./middleware/error";
import { MessageRequest, StatusRequest } from "./types";

const app = new Hono();

app.use("*", errorHandler);
app.use("/wapp/*", bearerAuth({ token: config.authToken }));

app.post("/wapp/update-status", async (c) => {
  const body = await c.req.json<StatusRequest>();

  if (!body.text) {
    return c.json(
      {
        success: false,
        error: "Status text is required",
      },
      400
    );
  }

  await whatsAppService.updateStatus(body.text);

  return c.json({
    success: true,
    message: "Status updated successfully",
  });
});

app.post("/wapp/send-message", async (c) => {
  const body = await c.req.json<MessageRequest>();
  const { type, jid, text } = body;

  if (!type || !["chat", "channel"].includes(type)) {
    return c.json(
      {
        success: false,
        error: "Valid message type is required (chat or channel)",
      },
      400
    );
  }

  if (!jid || !text) {
    return c.json(
      {
        success: false,
        error: "Both JID and text are required",
      },
      400
    );
  }

  await whatsAppService.sendMessage(body);

  return c.json({
    success: true,
    message: "Message sent successfully",
  });
});

whatsAppService.initialize();

serve({
  fetch: app.fetch,
  port: config.port,
});

console.log(`✨ Server started successfully on http://localhost:${config.port}`);