import { WASocket } from "@whiskeysockets/baileys";

export interface MessageRequest {
  type: "chat" | "channel";
  jid: string;
  text: string;
}

export interface StatusRequest {
  text: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export type WhatsAppSocket = WASocket;