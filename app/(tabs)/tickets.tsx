import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, FAB, Chip, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useDatabase } from '../../hooks/useDatabase';

interface Ticket {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  synced: number;
}

const priorityColors: Record<string, string> = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
  critical: '#9C27B0',
};

const statusColors: Record<string, string> = {
  open: '#2196F3',
  'in-progress': '#FF9800',
  resolved: '#4CAF50',
  closed: '#757575',
};

export default function TicketsScreen() {
  const router = useRouter();
  const { db, isReady } = useDatabase();
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const loadTickets = useCallback(async () => {
    if (!db) return;
    try {
      const results = await db.getAllAsync<Ticket>(
        'SELECT * FROM tickets ORDER BY created_at DESC'
      );
      setTickets(results);
    } catch {
      // DB not ready
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      if (isReady) loadTickets();
    }, [isReady, loadTickets])
  );

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => router.push(`/support/${item.id}`)}
          >
            <Card.Title
              title={item.title}
              subtitle={`${item.category} - ${formatDate(item.created_at)}`}
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name="ticket-outline"
                  size={36}
                  color={statusColors[item.status] || '#2196F3'}
                />
              )}
            />
            <Card.Content>
              <Text numberOfLines={2} variant="bodyMedium" style={styles.description}>
                {item.description}
              </Text>
              <View style={styles.chipRow}>
                <Chip
                  style={[styles.chip, { backgroundColor: priorityColors[item.priority] + '20' }]}
                  textStyle={{ color: priorityColors[item.priority], fontSize: 11 }}
                  compact
                >
                  {item.priority.toUpperCase()}
                </Chip>
                <Chip
                  style={[styles.chip, { backgroundColor: statusColors[item.status] + '20' }]}
                  textStyle={{ color: statusColors[item.status], fontSize: 11 }}
                  compact
                >
                  {item.status.toUpperCase()}
                </Chip>
                {!item.synced && (
                  <Chip
                    icon="cloud-off-outline"
                    style={[styles.chip, { backgroundColor: '#FFF3E0' }]}
                    textStyle={{ color: '#E65100', fontSize: 11 }}
                    compact
                  >
                    Not synced
                  </Chip>
                )}
              </View>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="ticket-confirmation-outline" size={64} color="#CCC" />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No Support Tickets
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Create a ticket when you need help from the support team
            </Text>
          </View>
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => router.push('/support/new-ticket')}
        color="#FFFFFF"
        customSize={56}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  description: {
    color: '#666',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    height: 28,
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    marginTop: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  emptyText: {
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#1B5E20',
  },
});
