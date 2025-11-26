import { LRUCache } from 'lru-cache';
import objectHash from 'object-hash';

interface CacheServiceOptions {
  max: number;
  ttl: number;
}

class CacheService<T> {
  private cache: LRUCache<string, T>;

  constructor(options: CacheServiceOptions) {
    this.cache = new LRUCache(options);
  }

  get(key: object): T | undefined {
    const hash = objectHash(key);
    return this.cache.get(hash);
  }

  set(key: object, value: T) {
    const hash = objectHash(key);
    this.cache.set(hash, value);
  }

  has(key: object): boolean {
    const hash = objectHash(key);
    return this.cache.has(hash);
  }
}

export default CacheService;
