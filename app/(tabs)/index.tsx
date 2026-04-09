import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Surface, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';

interface DashboardStats {
  equipmentCount: number;
  overdueCount: number;
  openTickets: number;
}

export default function HomeScreen() {
  const router = useRouter();
  const { db, isReady } = useDatabase();
  const [stats, setStats] = useState<DashboardStats>({
    equipmentCount: 0,
    overdueCount: 0,
    openTickets: 0,
  });

  useEffect(() => {
    if (!db || !isReady) return;
    loadStats();
  }, [db, isReady]);

  async function loadStats() {
    if (!db) return;
    try {
      const equipment = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM equipment'
      );
      const overdue = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM maintenance_schedule WHERE next_due < datetime('now')"
      );
      const tickets = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM tickets WHERE status = 'open'"
      );
      setStats({
        equipmentCount: equipment?.count ?? 0,
        overdueCount: overdue?.count ?? 0,
        openTickets: tickets?.count ?? 0,
      });
    } catch {
      // DB not ready yet
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.banner} elevation={2}>
        <MaterialCommunityIcons name="engine" size={48} color="#1B5E20" />
        <Text variant="headlineMedium" style={styles.bannerTitle}>
          Gas Compressor Support
        </Text>
        <Text variant="bodyMedium" style={styles.bannerSubtitle}>
          Reciprocating Compressor Technical Support
        </Text>
      </Surface>

      <View style={styles.statsRow}>
        <Surface style={styles.statCard} elevation={1}>
          <Text variant="headlineLarge" style={styles.statNumber}>
            {stats.equipmentCount}
          </Text>
          <Text variant="bodySmall">Equipment</Text>
        </Surface>
        <Surface style={[styles.statCard, stats.overdueCount > 0 && styles.statCardWarning]} elevation={1}>
          <Text variant="headlineLarge" style={[styles.statNumber, stats.overdueCount > 0 && styles.statNumberWarning]}>
            {stats.overdueCount}
          </Text>
          <Text variant="bodySmall">Overdue Tasks</Text>
        </Surface>
        <Surface style={styles.statCard} elevation={1}>
          <Text variant="headlineLarge" style={styles.statNumber}>
            {stats.openTickets}
          </Text>
          <Text variant="bodySmall">Open Tickets</Text>
        </Surface>
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Quick Actions</Text>

      <Card style={styles.actionCard} onPress={() => router.push('/(tabs)/troubleshoot')}>
        <Card.Title
          title="Troubleshoot Issue"
          subtitle="Step-by-step diagnostic guides"
          left={(props) => <MaterialCommunityIcons {...props} name="wrench" size={40} color="#1B5E20" />}
        />
      </Card>

      <Card style={styles.actionCard} onPress={() => router.push('/(tabs)/maintenance')}>
        <Card.Title
          title="Maintenance Schedule"
          subtitle="View upcoming tasks and log work"
          left={(props) => <MaterialCommunityIcons {...props} name="calendar-clock" size={40} color="#FF6F00" />}
        />
      </Card>

      <Card style={styles.actionCard} onPress={() => router.push('/support/new-ticket')}>
        <Card.Title
          title="Create Support Ticket"
          subtitle="Submit a new support request"
          left={(props) => <MaterialCommunityIcons {...props} name="message-plus" size={40} color="#1565C0" />}
        />
      </Card>

      <Card style={styles.actionCard} onPress={() => router.push('/maintenance/add-equipment')}>
        <Card.Title
          title="Add Equipment"
          subtitle="Register a new compressor unit"
          left={(props) => <MaterialCommunityIcons {...props} name="plus-circle" size={40} color="#6A1B9A" />}
        />
      </Card>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  banner: {
    alignItems: 'center',
    padding: 24,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  bannerTitle: {
    marginTop: 8,
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  bannerSubtitle: {
    color: '#666',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  statCardWarning: {
    backgroundColor: '#FFF3E0',
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#1B5E20',
  },
  statNumberWarning: {
    color: '#E65100',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  actionCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
});
