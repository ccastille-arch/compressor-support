import * as SQLite from 'expo-sqlite';
import { Database } from './schema';

const SQL_INIT = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, model TEXT NOT NULL,
    manufacturer TEXT NOT NULL DEFAULT 'Unknown', serial_number TEXT,
    location TEXT, install_date TEXT, notes TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS maintenance_log (
    id TEXT PRIMARY KEY, equipment_id TEXT NOT NULL, task_type TEXT NOT NULL,
    description TEXT NOT NULL, technician TEXT, hours_reading REAL,
    parts_replaced TEXT, notes TEXT, photos TEXT,
    completed_at TEXT DEFAULT (datetime('now')), synced INTEGER DEFAULT 0,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS maintenance_schedule (
    id TEXT PRIMARY KEY, equipment_id TEXT NOT NULL, task_name TEXT NOT NULL,
    interval_hours INTEGER, interval_days INTEGER, last_completed TEXT,
    next_due TEXT, priority TEXT DEFAULT 'normal',
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
    category TEXT NOT NULL, priority TEXT DEFAULT 'medium', status TEXT DEFAULT 'open',
    equipment_id TEXT, photos TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')),
    synced INTEGER DEFAULT 0,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id)
  );
  CREATE TABLE IF NOT EXISTS ticket_messages (
    id TEXT PRIMARY KEY, ticket_id TEXT NOT NULL, sender TEXT NOT NULL,
    message TEXT NOT NULL, photos TEXT,
    created_at TEXT DEFAULT (datetime('now')), synced INTEGER DEFAULT 0,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
  );
  CREATE TABLE IF NOT EXISTS troubleshoot_history (
    id TEXT PRIMARY KEY, guide_id TEXT NOT NULL, equipment_id TEXT,
    result TEXT, path_taken TEXT, notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`;

let db: any = null;

export async function getDatabase(): Promise<Database> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('compressor_support.db');
  await db.execAsync(SQL_INIT);
  return db as unknown as Database;
}
