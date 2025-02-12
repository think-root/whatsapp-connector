import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  proto,
  Browsers,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { WhatsAppSocket, MessageRequest } from "../types";

class WhatsAppService {
  private socket: WhatsAppSocket | null = null;

  async initialize(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState("auth_info_baileys");

    this.socket = makeWASocket({
      printQRInTerminal: true,
      auth: state,
      browser: Browsers.windows("Desktop"),
      syncFullHistory: true,
    });

    this.socket.ev.on("connection.update", (update) => {
      this.handleConnectionUpdate(update as { connection?: string; lastDisconnect?: { error?: Boom } });
    });
    this.socket.ev.on("creds.update", saveCreds);
  }
  private handleConnectionUpdate = async (update: {
    connection?: string;
    lastDisconnect?: { error?: Boom };
  }): Promise<void> => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      if (shouldReconnect) {
        this.initialize();
      }
    }
  };

  async updateStatus(text: string): Promise<void> {
    if (!this.socket) throw new Error("WhatsApp not initialized");
    await this.socket.updateProfileStatus(text);
    await this.socket.sendPresenceUpdate("unavailable");
  }

  async sendMessage(messageData: MessageRequest): Promise<void> {
    if (!this.socket) throw new Error("WhatsApp not initialized");

    const { type, jid, text } = messageData;

    if (type === "chat") {
      await this.socket.sendMessage(jid, { text });
    } else if (type === "channel") {
      const msg = { conversation: text };
      const plaintext = proto.Message.encode(msg).finish();
      const node = {
        tag: "message",
        attrs: { to: jid, type: "text" },
        content: [
          {
            tag: "plaintext",
            attrs: {},
            content: plaintext,
          },
        ],
      };

      await this.socket.query(node);
    }

    await this.socket.sendPresenceUpdate("unavailable");
  }
}

export const whatsAppService = new WhatsAppService();