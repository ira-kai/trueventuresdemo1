// Storage abstraction. On Vercel there is no persistent local disk, so anything
// stateful (suppression, prospects, experiments) must live in a hosted store.
//
// This ships with an in-memory dev implementation so the app runs locally and
// builds cleanly. For production, swap `store` for a Vercel KV / Postgres-backed
// implementation of the same `KVStore` interface — nothing else changes.

export interface KVStore {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  list<T>(prefix: string): Promise<T[]>;
  delete(key: string): Promise<void>;
}

class MemoryStore implements KVStore {
  private m = new Map<string, unknown>();
  async get<T>(key: string) { return (this.m.has(key) ? (this.m.get(key) as T) : null); }
  async set<T>(key: string, value: T) { this.m.set(key, value); }
  async list<T>(prefix: string) {
    const out: T[] = [];
    for (const [k, v] of this.m) if (k.startsWith(prefix)) out.push(v as T);
    return out;
  }
  async delete(key: string) { this.m.delete(key); }
}

// TODO(prod): replace with Vercel KV/Postgres impl behind this same interface.
export const store: KVStore = new MemoryStore();
