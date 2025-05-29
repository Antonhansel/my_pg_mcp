import pino from "pino";

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
      destination: 2, // Write to stderr (file descriptor 2)
    },
  },
});