import { CacheStats } from "../types";

interface CacheEntry<T> {
   value: T;
   timestamp: number;
   lastAccessed: number;
}

export class LRUCache<T> {
   private cache: Map<string, CacheEntry<T>>;
   private maxSize: number;
   private ttl: number;
   private hits: number = 0;
   private misses: number = 0;
   private responseTimes: number[] = [];
   private cleanupInterval: NodeJS.Timeout | null = null;

   constructor(maxSize: number = 100, ttlSeconds: number = 60) {
      this.cache = new Map();
      this.maxSize = maxSize;
      this.ttl = ttlSeconds * 1000;

      this.startCleanup();
   }

   get(key: string): T | null {
      const entry = this.cache.get(key);

      if (!entry) {
         this.misses++;
         return null;
      }

      const now = Date.now();

      if (now - entry.timestamp > this.ttl) {
         this.cache.delete(key);
         this.misses++;
         return null;
      }

      entry.lastAccessed = now;
      this.cache.delete(key);
      this.cache.set(key, entry);

      this.hits++;
      return entry.value;
   }

   set(key: string, value: T): void {
      const now = Date.now();

      if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
         const firstKey = this.cache.keys().next().value;
         if (firstKey) {
            this.cache.delete(firstKey);
         }
      }

      this.cache.set(key, {
         value,
         timestamp: now,
         lastAccessed: now
      });
   }

   has(key: string): boolean {
      const entry = this.cache.get(key);
      if (!entry) return false;

      const now = Date.now();
      if (now - entry.timestamp > this.ttl) {
         this.cache.delete(key);
         return false;
      }

      return true;
   }

   clear(): void {
      this.cache.clear();
      this.hits = 0;
      this.misses = 0;
      this.responseTimes = [];
   }

   recordResponseTime(time: number): void {
      this.responseTimes.push(time);
      if (this.responseTimes.length > 100) {
         this.responseTimes.shift();
      }
   }

   getStats(): CacheStats {
      const totalRequests = this.hits + this.misses;
      const hitRate = totalRequests > 0 ? ((this.hits / totalRequests) * 100).toFixed(2) : "0";

      const avgResponseTime =
         this.responseTimes.length > 0 ? (this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length).toFixed(2) : "0";

      return {
         size: this.cache.size,
         maxSize: this.maxSize,
         hits: this.hits,
         misses: this.misses,
         hitRate: `${hitRate}%`,
         averageResponseTime: `${avgResponseTime}ms`
      };
   }

   private startCleanup(): void {
      this.cleanupInterval = setInterval(() => {
         const now = Date.now();
         const keysToDelete: string[] = [];

         for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.ttl) {
               keysToDelete.push(key);
            }
         }

         if (keysToDelete.length > 0) {
            keysToDelete.forEach((key) => this.cache.delete(key));
            console.log(`[Cache Cleanup] Removed ${keysToDelete.length} stale entries`);
         }
      }, 10000);
   }

   stopCleanup(): void {
      if (this.cleanupInterval) {
         clearInterval(this.cleanupInterval);
         this.cleanupInterval = null;
      }
   }
}
