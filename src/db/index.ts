import * as schema from './schema';

export function getDb() {
  // 1. Cloudflare D1 Database binding in Edge environment
  const d1Binding = (process.env as any)?.DB || (globalThis as any)?.DB;
  if (d1Binding) {
    try {
      const { drizzle } = require('drizzle-orm/d1');
      return drizzle(d1Binding, { schema });
    } catch (e) {
      console.warn('D1 drizzle init error:', e);
    }
  }

  // 2. Local Node.js SQLite fallback (better-sqlite3)
  if (typeof process !== 'undefined' && process.versions?.node) {
    try {
      const Database = require('better-sqlite3');
      const { drizzle } = require('drizzle-orm/better-sqlite3');
      const path = require('path');
      const dbPath = path.resolve(process.cwd(), 'agentverse.db');
      const sqlite = new Database(dbPath);
      return drizzle(sqlite, { schema });
    } catch (e) {
      console.warn('Local better-sqlite3 initialization warning:', e);
    }
  }

  return {} as any;
}

export const db = new Proxy({} as any, {
  get(_, prop) {
    const target = getDb();
    const value = target[prop];
    return typeof value === 'function' ? value.bind(target) : value;
  },
});

export { schema };
