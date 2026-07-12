import { DEFAULT_LOG_LEVEL, LOG_LEVELS } from './constants.js';

const levelPriority = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40
};

function normalizeLevel(level) {
  const candidate = String(level ?? DEFAULT_LOG_LEVEL).toLowerCase();
  return LOG_LEVELS.includes(candidate) ? candidate : DEFAULT_LOG_LEVEL;
}

function shouldLog(requestedLevel) {
  const activeLevel = normalizeLevel(process.env.LOG_LEVEL);
  return levelPriority[requestedLevel] >= levelPriority[activeLevel];
}

function serializeMeta(meta) {
  if (meta == null) {
    return '';
  }

  if (meta instanceof Error) {
    return JSON.stringify({
      name: meta.name,
      message: meta.message,
      stack: meta.stack
    });
  }

  return JSON.stringify(meta);
}

function write(level, message, meta) {
  if (!shouldLog(level)) {
    return;
  }

  const timestamp = new Date().toISOString();
  const payload = serializeMeta(meta);
  const output = payload ? `[${timestamp}] [${level.toUpperCase()}] ${message} ${payload}` : `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  const loggerMethod = level === 'debug' ? console.debug : console[level] ?? console.info;
  loggerMethod.call(console, output);
}

export const logger = Object.freeze({
  debug(message, meta) {
    write('debug', message, meta);
  },
  info(message, meta) {
    write('info', message, meta);
  },
  warn(message, meta) {
    write('warn', message, meta);
  },
  error(message, meta) {
    write('error', message, meta);
  }
});
