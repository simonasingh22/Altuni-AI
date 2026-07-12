import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './config/environment.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import { logger } from './utils/logger.js';
import { REQUEST_ID_HEADER } from './utils/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientBuildPath = path.resolve(__dirname, '../../client/dist');

morgan.token('request-id', (request) => request.requestId ?? '-');

function createMorganStream() {
  return {
    write(message) {
      logger.info(message.trim());
    }
  };
}

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.set('env', env.NODE_ENV);
  app.locals.environment = env.NODE_ENV;
  app.locals.serviceName = env.APP_NAME;
  app.locals.serviceVersion = env.APP_VERSION;

  app.use(requestIdMiddleware);
  app.use(requestLogger);
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      allowedHeaders: ['Content-Type', REQUEST_ID_HEADER]
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    morgan(':request-id :method :url :status :response-time ms', {
      stream: createMorganStream()
    })
  );

  app.use('/api', apiRouter);

  if (env.NODE_ENV === 'production') {
    logger.info('Serving React client production assets statically', { path: clientBuildPath });
    app.use(express.static(clientBuildPath));
    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    app.use(notFoundHandler);
  }

  app.use(errorHandler);

  return app;
}

const app = createApp();

export default app;
