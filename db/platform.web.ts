import { Database, DatabaseRow } from './schema';

interface TableStore {
  [tableName: string]: DatabaseRow[];
}

class WebDatabase implements Database {
  private store: TableStore;
  private storageKey = 'compressor_support_db';

  constructor() {
    const saved = localStorage.getItem(this.storageKey);
    this.store = saved ? JSON.parse(saved) : {};
    this.ensureTables();
  }

  private ensureTables() {
    const tables = ['equipment', 'maintenance_log', 'maintenance_schedule', 'tickets', 'ticket_messages', 'troubleshoot_history'];
    for (const t of tables) {
      if (!this.store[t]) this.store[t] = [];
    }
    this.save();
  }

  private save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.store));
  }

  private getTable(query: string): string | null {
    const fromMatch = query.match(/FROM\s+(\w+)/i);
    const intoMatch = query.match(/INTO\s+(\w+)/i);
    const updateMatch = query.match(/UPDATE\s+(\w+)/i);
    return fromMatch?.[1] || intoMatch?.[1] || updateMatch?.[1] || null;
  }

  async getFirstAsync<T = DatabaseRow>(query: string, params: any[] = []): Promise<T | null> {
    const countMatch = query.match(/SELECT\s+COUNT\(\*\)\s+as\s+(\w+)\s+FROM\s+(\w+)/i);
    if (countMatch) {
      const [, alias, table] = countMatch;
      let rows = this.store[table] || [];
      if (query.includes("status = 'open'")) rows = rows.filter(r => r.status === 'open');
      if (query.includes("synced = 0")) rows = rows.filter(r => r.synced === 0);
      if (query.includes("next_due < datetime('now')")) rows = rows.filter(r => r.next_due && new Date(r.next_due) < new Date());
      return { [alias]: rows.length } as any;
    }

    const table = this.getTable(query);
    if (!table) return null;
    const rows = this.store[table] || [];

    if (params.length > 0 && query.includes('WHERE')) {
      const idMatch = query.match(/WHERE\s+\w*\.?(\w+)\s*=\s*\?/i);
      if (idMatch) {
        return (rows.find(r => r[idMatch[1]] === params[0]) as T) || null;
      }
    }
    return (rows[0] as T) || null;
  }

  async getAllAsync<T = DatabaseRow>(query: string, params: any[] = []): Promise<T[]> {
    const table = this.getTable(query);
    if (!table) return [];
    let rows = [...(this.store[table] || [])];

    if (params.length > 0 && query.includes('WHERE')) {
      const idMatch = query.match(/WHERE\s+\w*\.?(\w+)\s*=\s*\?/i);
      if (idMatch) {
        rows = rows.filter(r => r[idMatch[1]] === params[0]);
      }
    }
    if (query.includes('synced = 0')) rows = rows.filter(r => r.synced === 0);
    if (query.includes("status = 'open'")) rows = rows.filter(r => r.status === 'open');

    if (query.includes('ORDER BY') && query.includes('DESC')) {
      rows.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
    }
    if (query.includes('ORDER BY') && query.includes('ASC')) {
      rows.sort((a, b) => new Date(a.next_due || a.created_at || 0).getTime() - new Date(b.next_due || b.created_at || 0).getTime());
    }

    const limitMatch = query.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) rows = rows.slice(0, parseInt(limitMatch[1]));

    return rows as T[];
  }

  async runAsync(query: string, params: any[] = []): Promise<void> {
    const upper = query.trim().toUpperCase();

    if (upper.startsWith('INSERT')) {
      const table = this.getTable(query);
      if (!table) return;
      const colMatch = query.match(/\(([^)]+)\)\s*VALUES/i);
      if (colMatch) {
        const cols = colMatch[1].split(',').map(c => c.trim());
        const row: DatabaseRow = {};
        cols.forEach((col, i) => {
          row[col] = params[i] !== undefined ? params[i] : null;
        });
        if (!row.created_at) row.created_at = new Date().toISOString();
        if (!row.updated_at) row.updated_at = new Date().toISOString();
        if (row.completed_at === undefined && table === 'maintenance_log') {
          row.completed_at = new Date().toISOString();
        }
        if (!this.store[table]) this.store[table] = [];
        this.store[table].push(row);
      }
    } else if (upper.startsWith('UPDATE')) {
      const table = this.getTable(query);
      if (!table) return;
      const rows = this.store[table] || [];
      const whereMatch = query.match(/WHERE\s+\w*\.?(\w+)\s*(=|LIKE)\s*\?/i);
      if (whereMatch) {
        const field = whereMatch[1];
        const val = params[params.length - 1];
        for (const row of rows) {
          const matches = whereMatch[2] === 'LIKE'
            ? String(row[field] || '').toLowerCase().includes(String(val).replace(/%/g, '').toLowerCase())
            : row[field] === val;
          if (matches) {
            if (query.includes('synced = 1')) row.synced = 1;
            if (query.includes("last_completed = datetime('now')")) row.last_completed = new Date().toISOString();
          }
        }
      }
    } else if (upper.startsWith('DELETE')) {
      const table = this.getTable(query);
      if (!table) return;
      const whereMatch = query.match(/WHERE\s+(\w+)\s*=\s*\?/i);
      if (whereMatch) {
        this.store[table] = (this.store[table] || []).filter(r => r[whereMatch[1]] !== params[0]);
      }
    }

    this.save();
  }

  async execAsync(_sql: string): Promise<void> {}
}

let instance: WebDatabase | null = null;

export async function getDatabase(): Promise<Database> {
  if (!instance) instance = new WebDatabase();
  return instance;
}
