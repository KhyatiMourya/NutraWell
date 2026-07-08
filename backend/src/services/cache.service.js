class CacheService {
  constructor() {
    this.cache = new Map();
    this.ttl = 10 * 60 * 1000; // 10 minutes default cache duration
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, customTtlMs) {
    const expiry = Date.now() + (customTtlMs || this.ttl);
    this.cache.set(key, { value, expiry });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export default new CacheService();
