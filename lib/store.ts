// Storage abstraction. On Vercel serverless there is no persistent local disk or
// shared memory between invocations, so stateful data (suppression, prospects,
// events, experiments) must live in a hosted store.
//
// Selection is automatic:
//   - Vercel KV present (KV_REST_API_URL + KV_REST_API_TOKEN) -> VercelKVStore
//   - otherwise                                               -> MemoryStore (dev)
// Nothing else in the codebase changes — they implement the same KVStore.

export interface KVStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  list<T>(prefix: string): Promise<T[]>;
  delete(key: string): Promise<void>;
}

// In-memory: used in dev and scripts. Verified by demo.ts / simulate.ts.
class MemoryStore implements KVStore {
  private m = new Map<string, unknown>();
  async get<T>(key: string) { return this.m.has(key) ? (this.m.get(key) as T) : null; }
  async set<T>(key: string, value: T) { this.m.set(key, value); }
  async list<T>(prefix: string) {
    const out: T[] = [];
    for (const [k, v] of this.m) if (k.startsWith(prefix)) out.push(v as T);
    return out;
  }
  async delete(key: string) { this.m.delete(key); }
}

// Vercel KV (Redis-backed, REST). Works on serverless. Unverified without creds;
// the interface mirrors MemoryStore so behavior is identical.
class VercelKVStore implements KVStore {
  async get<T>(key: string): Promise<T | null> {
    const { kv } = await import("@vercel/kv");
    return (await kv.get<T>(key)) ?? null;
  }
  async set<T>(key: string, value: T): Promise<void> {
    const { kv } = await import("@vercel/kv");
    await kv.set(key, value as unknown as string);
  }
  async list<T>(prefix: string): Promise<T[]> {
    const { kv } = await import("@vercel/kv");
    const keys = await kv.keys(`${prefix}*`);
    if (!keys.length) return [];
    const vals = await kv.mget<T[]>(...keys);
    return vals.filter((v): v is T => v != null);
  }
  async delete(key: string): Promise<void> {
    const { kv } = await import("@vercel/kv");
    await kv.del(key);
  }
}

function selectStore(): KVStore {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return new VercelKVStore();
  }
  return new MemoryStore();
}

export const store: KVStore = selectStore();
export const usingPersistentStore =
  !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
