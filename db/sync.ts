import * as Network from 'expo-network';
import { Database } from './schema';

const API_BASE_URL = 'https://your-api-server.com/api'; // Configure this

export async function isOnline(): Promise<boolean> {
  try {
    const state = await Network.getNetworkStateAsync();
    return state.isConnected === true && state.isInternetReachable === true;
  } catch {
    return false;
  }
}

export async function syncPendingData(db: Database): Promise<{
  ticketsSynced: number;
  logsSynced: number;
  messagesSynced: number;
  errors: string[];
}> {
  const result = {
    ticketsSynced: 0,
    logsSynced: 0,
    messagesSynced: 0,
    errors: [] as string[],
  };

  if (!(await isOnline())) {
    result.errors.push('No internet connection');
    return result;
  }

  // Sync unsynced tickets
  try {
    const tickets = await db.getAllAsync(
      'SELECT * FROM tickets WHERE synced = 0'
    );
    for (const ticket of tickets) {
      try {
        // Replace with your actual API call
        // await fetch(`${API_BASE_URL}/tickets`, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(ticket),
        // });
        await db.runAsync(
          'UPDATE tickets SET synced = 1 WHERE id = ?',
          [(ticket as any).id]
        );
        result.ticketsSynced++;
      } catch (e) {
        result.errors.push(`Failed to sync ticket: ${(ticket as any).id}`);
      }
    }
  } catch (e) {
    result.errors.push('Failed to query unsynced tickets');
  }

  // Sync unsynced maintenance logs
  try {
    const logs = await db.getAllAsync(
      'SELECT * FROM maintenance_log WHERE synced = 0'
    );
    for (const log of logs) {
      try {
        // await fetch(`${API_BASE_URL}/maintenance-logs`, { ... });
        await db.runAsync(
          'UPDATE maintenance_log SET synced = 1 WHERE id = ?',
          [(log as any).id]
        );
        result.logsSynced++;
      } catch (e) {
        result.errors.push(`Failed to sync log: ${(log as any).id}`);
      }
    }
  } catch (e) {
    result.errors.push('Failed to query unsynced logs');
  }

  // Sync unsynced messages
  try {
    const messages = await db.getAllAsync(
      'SELECT * FROM ticket_messages WHERE synced = 0'
    );
    for (const msg of messages) {
      try {
        // await fetch(`${API_BASE_URL}/messages`, { ... });
        await db.runAsync(
          'UPDATE ticket_messages SET synced = 1 WHERE id = ?',
          [(msg as any).id]
        );
        result.messagesSynced++;
      } catch (e) {
        result.errors.push(`Failed to sync message: ${(msg as any).id}`);
      }
    }
  } catch (e) {
    result.errors.push('Failed to query unsynced messages');
  }

  return result;
}

export async function getUnsyncedCounts(db: Database): Promise<{
  tickets: number;
  logs: number;
  messages: number;
}> {
  const tickets = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM tickets WHERE synced = 0'
  );
  const logs = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM maintenance_log WHERE synced = 0'
  );
  const messages = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM ticket_messages WHERE synced = 0'
  );

  return {
    tickets: tickets?.count ?? 0,
    logs: logs?.count ?? 0,
    messages: messages?.count ?? 0,
  };
}
