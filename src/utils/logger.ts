import pino from "pino";
import { env } from "../env";

const isDevelopment = env.NODE_ENV !== "production";

export const logger = pino({
   level: process.env.LOG_LEVEL || "info",
   base: undefined,

   timestamp: pino.stdTimeFunctions.isoTime,

   ...(isDevelopment && {
      formatters: {
         level: (label: string) => {
            return { level: label.toUpperCase() };
         }
      }
   })
});

export const createLogger = (module: string) => {
   return logger.child({ module });
};
