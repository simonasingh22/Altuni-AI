import app from './app.js';
import { env } from './config/environment.js';
import { logger } from './utils/logger.js';

const SHUTDOWN_TIMEOUT_MS = 10000;

let activeServer = null;

function closeServer(exitCode, reason, error = null) {
  if (error) {
    logger.error(`Shutting down after ${reason}`, error);
  } else {
    logger.warn(`Shutting down after ${reason}`);
  }

  if (!activeServer) {
    process.exit(exitCode);
    return;
  }

  const timeoutHandle = setTimeout(() => {
    logger.error(`Forced exit after ${reason}`);
    process.exit(exitCode);
  }, SHUTDOWN_TIMEOUT_MS);

  timeoutHandle.unref();

  activeServer.close((closeError) => {
    clearTimeout(timeoutHandle);

    if (closeError) {
      logger.error('Error while closing server', closeError);
      process.exit(1);
      return;
    }

    process.exit(exitCode);
  });
}

function registerProcessHandlers() {
  process.on('SIGINT', () => closeServer(0, 'SIGINT'));
  process.on('SIGTERM', () => closeServer(0, 'SIGTERM'));
  process.on('unhandledRejection', (reason) => {
    closeServer(1, 'unhandledRejection', reason instanceof Error ? reason : new Error(String(reason)));
  });
  process.on('uncaughtException', (error) => {
    closeServer(1, 'uncaughtException', error);
  });
}

export function startServer() {
  registerProcessHandlers();

  activeServer = app.listen(env.PORT, env.HOST, () => {
    logger.info(`Server started on ${env.HOST}:${env.PORT}`, {
      service: env.APP_NAME,
      version: env.APP_VERSION,
      environment: env.NODE_ENV
    });
  });

  return activeServer;
}

startServer();
