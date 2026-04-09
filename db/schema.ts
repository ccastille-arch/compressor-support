export interface DatabaseRow {
  [key: string]: any;
}

export interface Database {
  getFirstAsync<T = DatabaseRow>(query: string, params?: any[]): Promise<T | null>;
  getAllAsync<T = DatabaseRow>(query: string, params?: any[]): Promise<T[]>;
  runAsync(query: string, params?: any[]): Promise<void>;
  execAsync(sql: string): Promise<void>;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// Platform-specific getDatabase is provided by:
// - db/platform.web.ts (web: localStorage)
// - db/platform.native.ts (native: expo-sqlite)
// Imported via db/platform.ts which metro resolves per platform
