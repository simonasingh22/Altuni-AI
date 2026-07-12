import { env } from '../config/environment.js';

export function getHealth(_request, response) {
  response.status(200).json({
    status: 'ok',
    service: env.APP_NAME,
    version: env.APP_VERSION,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
}
