type LogLevel = 'info' | 'error' | 'debug';

interface LogMessage {
  timestamp: string;
  level: LogLevel;
  method?: string;
  path?: string;
  duration?: number;
  statusCode?: number;
  body?: unknown;
  headers?: Record<string, string>;
  error?: unknown;
}

class Logger {
  private formatMessage(message: LogMessage): string {
    return JSON.stringify(message, null, 2);
  }

  info(message: Omit<LogMessage, 'level'>): void {
    console.log(this.formatMessage({ ...message, level: 'info' }));
  }

  error(message: Omit<LogMessage, 'level'>): void {
    console.error(this.formatMessage({ ...message, level: 'error' }));
  }

  debug(message: Omit<LogMessage, 'level'>): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage({ ...message, level: 'debug' }));
    }
  }
}

export const logger = new Logger();