import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  authToken: process.env.AUTH_TOKEN ?? "",
  environment: process.env.NODE_ENV ?? "development",
} as const;