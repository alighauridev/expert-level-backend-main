import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/ApiError";
import { HTTP_STATUS } from "../utils/httpStatus";

interface RateLimitEntry {
   minuteRequests: number[];
   burstRequests: number[];
}

export class RateLimiter {
   private limits: Map<string, RateLimitEntry>;
   private readonly MINUTE_LIMIT = 10;
   private readonly BURST_LIMIT = 5;
   private readonly MINUTE_WINDOW = 60 * 1000;
   private readonly BURST_WINDOW = 10 * 1000;

   constructor() {
      this.limits = new Map();

      setInterval(() => {
         const now = Date.now();
         for (const [key, entry] of this.limits.entries()) {
            if (entry.minuteRequests.length === 0 || now - entry.minuteRequests[0] > this.MINUTE_WINDOW * 2) {
               this.limits.delete(key);
            }
         }
      }, 120000);
   }

   middleware() {
      return (req: Request, res: Response, next: NextFunction) => {
         const identifier = this.getIdentifier(req);
         console.log(`[RateLimiter] Request from identifier: ${identifier}`);
         if (this.isRateLimited(identifier)) {
            return ApiError.custom(next, HTTP_STATUS.TOO_MANY_REQUESTS, "Rate limit exceeded. Please try again later");
         }

         this.recordRequest(identifier);
         next();
      };
   }

   private isRateLimited(identifier: string): boolean {
      const now = Date.now();
      const entry = this.limits.get(identifier);

      if (!entry) return false;

      entry.minuteRequests = entry.minuteRequests.filter((timestamp) => now - timestamp < this.MINUTE_WINDOW);
      entry.burstRequests = entry.burstRequests.filter((timestamp) => now - timestamp < this.BURST_WINDOW);

      const minuteExceeded = entry.minuteRequests.length >= this.MINUTE_LIMIT;
      const burstExceeded = entry.burstRequests.length >= this.BURST_LIMIT;

      return minuteExceeded || burstExceeded;
   }

   private recordRequest(identifier: string): void {
      const now = Date.now();
      const entry = this.limits.get(identifier) || {
         minuteRequests: [],
         burstRequests: []
      };

      entry.minuteRequests.push(now);
      entry.burstRequests.push(now);

      this.limits.set(identifier, entry);
   }

   private getIdentifier(req: Request): string {
      return req.ip || req.socket.remoteAddress || "unknown";
   }

   clear(): void {
      this.limits.clear();
   }
}

const rateLimiterInstance = new RateLimiter();
export const rateLimiter = rateLimiterInstance.middleware();

export const rateLimiterService = rateLimiterInstance;
