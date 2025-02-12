import { Context, Next } from "hono";
import { logger } from "../services/logger";

export async function errorHandler(c: Context, next: Next) {
  const startTime = Date.now();
  const method = c.req.method;
  const path = c.req.path;

  try {
    const headers = Object.fromEntries(
      Object.entries(c.req.raw.headers)
    );
    const body = c.req.header('content-type')?.includes('application/json')
      ? await c.req.json().catch(() => undefined)
      : undefined;

    logger.info({
      timestamp: new Date().toISOString(),
      method,
      path,
      headers,
      body,
    });

    await next();

    const duration = Date.now() - startTime;
    logger.info({
      timestamp: new Date().toISOString(),
      method,
      path,
      duration,
      statusCode: c.res.status,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error({
      timestamp: new Date().toISOString(),
      method,
      path,
      duration,
      error,
    });

    return c.json(
      {
        success: false,
        error: "Internal server error",
      },
      500
    );
  }
}