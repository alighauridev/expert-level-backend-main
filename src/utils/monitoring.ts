/**
 * Simple Monitoring & Logging Solution with Pino
 * Tracks API performance metrics over time
 */

import { logger } from "../utils/logger";

interface MetricEntry {
   timestamp: Date;
   endpoint: string;
   method: string;
   statusCode: number;
   responseTime: number;
   cached?: boolean;
   error?: string;
}

interface ErrorEntry {
   timestamp: Date;
   endpoint: string;
   method: string;
   statusCode: number;
   message: string;
   stack?: string;
}

export class MonitoringService {
   private metrics: MetricEntry[] = [];
   private errors: ErrorEntry[] = [];
   private readonly MAX_ENTRIES = 1000; // Keep last 1000 entries

   /**
    * Log a request metric
    */
   logRequest(data: { endpoint: string; method: string; statusCode: number; responseTime: number; cached?: boolean }): void {
      this.metrics.push({
         timestamp: new Date(),
         ...data
      });

      // Keep only last MAX_ENTRIES
      if (this.metrics.length > this.MAX_ENTRIES) {
         this.metrics.shift();
      }

      // Log to Pino with proper level
      const level = data.statusCode >= 500 ? "error" : data.statusCode >= 400 ? "warn" : "info";

      logger[level](
         {
            type: "REQUEST",
            endpoint: data.endpoint,
            method: data.method,
            statusCode: data.statusCode,
            responseTime: data.responseTime,
            cached: data.cached
         },
         `${data.method} ${data.endpoint} ${data.statusCode} - ${data.responseTime}ms`
      );
   }

   /**
    * Log an error
    */
   logError(data: { endpoint: string; method: string; statusCode: number; message: string; stack?: string }): void {
      this.errors.push({
         timestamp: new Date(),
         ...data
      });

      // Keep only last MAX_ENTRIES
      if (this.errors.length > this.MAX_ENTRIES) {
         this.errors.shift();
      }

      // Log to Pino
      logger.error(
         {
            type: "ERROR",
            endpoint: data.endpoint,
            method: data.method,
            statusCode: data.statusCode,
            message: data.message,
            stack: data.stack
         },
         `Error: ${data.message}`
      );
   }

   /**
    * Get metrics for a time period
    */
   getMetrics(minutes: number = 5) {
      const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
      return this.metrics.filter((m) => m.timestamp > cutoffTime);
   }

   /**
    * Get error rate
    */
   getErrorRate(minutes: number = 5): number {
      const recentMetrics = this.getMetrics(minutes);
      if (recentMetrics.length === 0) return 0;

      const errorCount = recentMetrics.filter((m) => m.statusCode >= 400).length;
      return (errorCount / recentMetrics.length) * 100;
   }

   /**
    * Get average response time
    */
   getAverageResponseTime(minutes: number = 5): number {
      const recentMetrics = this.getMetrics(minutes);
      if (recentMetrics.length === 0) return 0;

      const sum = recentMetrics.reduce((acc, m) => acc + m.responseTime, 0);
      return Math.round((sum / recentMetrics.length) * 100) / 100;
   }

   /**
    * Get cache hit rate
    */
   getCacheHitRate(minutes: number = 5): number {
      const recentMetrics = this.getMetrics(minutes).filter((m) => m.cached !== undefined);
      if (recentMetrics.length === 0) return 0;

      const cacheHits = recentMetrics.filter((m) => m.cached === true).length;
      return (cacheHits / recentMetrics.length) * 100;
   }

   /**
    * Get requests per minute
    */
   getRequestsPerMinute(minutes: number = 5): number {
      const recentMetrics = this.getMetrics(minutes);
      return Math.round((recentMetrics.length / minutes) * 100) / 100;
   }

   /**
    * Get comprehensive monitoring report
    */
   getReport(minutes: number = 5) {
      const recentMetrics = this.getMetrics(minutes);
      const recentErrors = this.errors.filter((e) => e.timestamp > new Date(Date.now() - minutes * 60 * 1000));

      return {
         period: `Last ${minutes} minutes`,
         totalRequests: recentMetrics.length,
         requestsPerMinute: this.getRequestsPerMinute(minutes),
         averageResponseTime: this.getAverageResponseTime(minutes),
         errorRate: this.getErrorRate(minutes).toFixed(2) + "%",
         cacheHitRate: this.getCacheHitRate(minutes).toFixed(2) + "%",
         statusCodeBreakdown: this.getStatusCodeBreakdown(recentMetrics),
         topEndpoints: this.getTopEndpoints(recentMetrics),
         recentErrors: recentErrors.slice(-10).map((e) => ({
            timestamp: e.timestamp,
            endpoint: e.endpoint,
            statusCode: e.statusCode,
            message: e.message
         }))
      };
   }

   /**
    * Get status code breakdown
    */
   private getStatusCodeBreakdown(metrics: MetricEntry[]) {
      const breakdown: Record<string, number> = {
         "2xx": 0,
         "4xx": 0,
         "5xx": 0
      };

      metrics.forEach((m) => {
         if (m.statusCode >= 200 && m.statusCode < 300) breakdown["2xx"]++;
         else if (m.statusCode >= 400 && m.statusCode < 500) breakdown["4xx"]++;
         else if (m.statusCode >= 500) breakdown["5xx"]++;
      });

      return breakdown;
   }

   /**
    * Get top endpoints by request count
    */
   private getTopEndpoints(metrics: MetricEntry[]) {
      const counts: Record<string, number> = {};

      metrics.forEach((m) => {
         const key = `${m.method} ${m.endpoint}`;
         counts[key] = (counts[key] || 0) + 1;
      });

      return Object.entries(counts)
         .sort((a, b) => b[1] - a[1])
         .slice(0, 5)
         .map(([endpoint, count]) => ({ endpoint, count }));
   }

   /**
    * Export metrics to JSON (for external monitoring tools)
    */
   exportMetrics() {
      return {
         metrics: this.metrics,
         errors: this.errors,
         exportedAt: new Date().toISOString()
      };
   }
}

// Export singleton instance
export const monitoring = new MonitoringService();
