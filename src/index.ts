import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  proto,
  Browsers,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import dotenv from "dotenv";

dotenv.config();

const app = new Hono();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
let sock: any = null;

app.use("/wapp/*", bearerAuth({ token: process.env.AUTH_TOKEN ?? "" }));
async function initializeWA() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

  sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    browser: Browsers.windows("Desktop"),
    syncFullHistory: true
  });

  sock.ev.on(
    "connection.update",
    async (update: { connection?: string; lastDisconnect?: { error?: Boom } }) => {
      const { connection, lastDisconnect } = update;

      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          initializeWA();
        }
      }
    }
  );

  sock.ev.on("creds.update", saveCreds);
}

app.post("/wapp/update-status", async (c) => {
  try {
    const body = await c.req.json();
    const { text } = body;

    if (!text) {
      return c.json(
        {
          success: false,
          error: "Status text is required",
        },
        400
      );
    }

    await sock.updateProfileStatus(text);

    return c.json({
      success: true,
      message: "Status updated successfully",
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Failed to update status",
      },
      500
    );
  } finally {
    await sock.sendPresenceUpdate("unavailable");
  }
});

app.post("/wapp/send-message", async (c) => {
  try {
    const body = await c.req.json();
    const { type, jid, text } = body;

    if (!type) {
      return c.json(
        {
          success: false,
          error: "Message type is required (chat or channel)",
        },
        400
      );
    }

    if (type === "chat") {
      if (!jid || !text) {
        return c.json(
          {
            success: false,
            error: "Both JID and text are required for chat messages",
          },
          400
        );
      }
      await sock.sendMessage(jid, { text });
    } else if (type === "channel") {
      if (!text) {
        return c.json(
          {
            success: false,
            error: "text is required for channel messages",
          },
          400
        );
      }

      if (!jid) {
        return c.json(
          {
            success: false,
            error: "jid is required for channel messages",
          },
          500
        );
      }

      const msg = { conversation: text };
      const plaintext = proto.Message.encode(msg).finish();
      const plaintextNode = {
        tag: "plaintext",
        attrs: {},
        content: plaintext,
      };
      const node = {
        tag: "message",
        attrs: { to: jid, type: "text" },
        content: [plaintextNode],
      };

      await sock.query(node);
    } else {
      return c.json(
        {
          success: false,
          error: "Invalid message type. Use 'chat' or 'channel'",
        },
        400
      );
    }

    return c.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Failed to send message",
      },
      500
    );
  } finally {
    await sock.sendPresenceUpdate("unavailable");
  }
});

initializeWA();

serve({
  fetch: app.fetch,
  port: PORT ? PORT : 3000,
});

console.log(`✨ Server started successfully on http://localhost:${PORT}`);