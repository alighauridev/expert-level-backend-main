export class PerformanceTracker {
   private responseTimes: number[] = [];
   private totalRequests: number = 0;
   private readonly MAX_SAMPLES = 1000;
   recordResponseTime(timeInMs: number): void {
      this.totalRequests++;
      this.responseTimes.push(timeInMs);

      if (this.responseTimes.length > this.MAX_SAMPLES) {
         this.responseTimes.shift();
      }
   }

   getAverageResponseTime(): number {
      if (this.responseTimes.length === 0) return 0;

      const sum = this.responseTimes.reduce((acc, time) => acc + time, 0);
      return Math.round((sum / this.responseTimes.length) * 100) / 100;
   }

   getMetrics() {
      return {
         totalRequests: this.totalRequests,
         averageResponseTime: this.getAverageResponseTime(),
         minResponseTime: this.responseTimes.length > 0 ? Math.min(...this.responseTimes) : 0,
         maxResponseTime: this.responseTimes.length > 0 ? Math.max(...this.responseTimes) : 0,
         samplesRecorded: this.responseTimes.length
      };
   }

   reset(): void {
      this.responseTimes = [];
      this.totalRequests = 0;
   }
}
