import { v4 as uuidv4 } from 'uuid';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  errorStack?: string;
}

/**
 * Simple structured logger that keeps logs in memory and can
 * also write to console. Reporter can consume log entries.
 */
export class Logger {
  private entries: LogEntry[] = [];

  constructor(private readonly scope: string) {}

  getLogs(): LogEntry[] {
    return this.entries;
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>, errorStack?: string) {
    const entry: LogEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      level,
      message: `[${this.scope}] ${message}`,
      context,
      errorStack,
    };
    this.entries.push(entry);

    // Console output for local debugging
    // eslint-disable-next-line no-console
    console.log(`${entry.timestamp} [${level.toUpperCase()}] ${entry.message}`, context ?? '', errorStack ?? '');
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context);
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    const stack = error instanceof Error ? error.stack : undefined;
    this.log('error', message, { ...(context ?? {}), error }, stack);
  }
}

