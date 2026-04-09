import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, Chip, Divider, Surface, List } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { useDatabase } from '../../hooks/useDatabase';

interface EquipmentDetail {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serial_number: string | null;
  location: string | null;
  install_date: string | null;
  notes: string | null;
}

interface ScheduleItem {
  id: string;
  task_name: string;
  interval_hours: number | null;
  interval_days: number | null;
  next_due: string;
  priority: string;
  last_completed: string | null;
}

interface LogEntry {
  id: string;
  task_type: string;
  description: string;
  technician: string | null;
  completed_at: string;
}

export default function EquipmentDetailScreen() {
  const { equipmentId } = useLocalSearchParams<{ equipmentId: string }>();
  const router = useRouter();
  const { db, isReady } = useDatabase();
  const [equipment, setEquipment] = useState<EquipmentDetail | null>(null);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [history, setHistory] = useState<LogEntry[]>([]);

  const loadData = useCallback(async () => {
    if (!db || !equipmentId) return;
    try {
      const eq = await db.getFirstAsync<EquipmentDetail>(
        'SELECT * FROM equipment WHERE id = ?',
        [equipmentId]
      );
      setEquipment(eq);

      const sched = await db.getAllAsync<ScheduleItem>(
        'SELECT * FROM maintenance_schedule WHERE equipment_id = ? ORDER BY next_due ASC',
        [equipmentId]
      );
      setSchedule(sched);

      const logs = await db.getAllAsync<LogEntry>(
        'SELECT * FROM maintenance_log WHERE equipment_id = ? ORDER BY completed_at DESC LIMIT 20',
        [equipmentId]
      );
      setHistory(logs);
    } catch {
      // ignore
    }
  }, [db, equipmentId]);

  useFocusEffect(
    useCallback(() => {
      if (isReady) loadData();
    }, [isReady, loadData])
  );

  function isOverdue(dateStr: string): boolean {
    return new Date(dateStr) < new Date();
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function daysUntil(dateStr: string): number {
    const diff = new Date(dateStr).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  if (!equipment) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: equipment.name }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Equipment Info */}
        <Surface style={styles.infoCard} elevation={1}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="engine" size={40} color="#1B5E20" />
            <View style={styles.infoText}>
              <Text variant="titleLarge" style={styles.equipName}>
                {equipment.name}
              </Text>
              <Text variant="bodyMedium" style={styles.equipModel}>
                {equipment.manufacturer} {equipment.model}
              </Text>
            </View>
          </View>
          {equipment.serial_number && (
            <Text variant="bodySmall" style={styles.detail}>
              S/N: {equipment.serial_number}
            </Text>
          )}
          {equipment.location && (
            <Text variant="bodySmall" style={styles.detail}>
              Location: {equipment.location}
            </Text>
          )}
          {equipment.install_date && (
            <Text variant="bodySmall" style={styles.detail}>
              Installed: {formatDate(equipment.install_date)}
            </Text>
          )}
        </Surface>

        {/* Quick Actions */}
        <View style={styles.actionRow}>
          <Button
            mode="contained"
            icon="clipboard-plus"
            onPress={() =>
              router.push({
                pathname: '/maintenance/log-entry',
                params: { equipmentId: equipment.id, equipmentName: equipment.name },
              })
            }
            buttonColor="#1B5E20"
            style={styles.actionButton}
            compact
          >
            Log Maintenance
          </Button>
          <Button
            mode="outlined"
            icon="wrench"
            onPress={() => router.push('/(tabs)/troubleshoot')}
            textColor="#1B5E20"
            style={styles.actionButton}
            compact
          >
            Troubleshoot
          </Button>
        </View>

        {/* Upcoming Maintenance */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Maintenance Schedule
        </Text>

        {schedule.map((item) => {
          const overdue = isOverdue(item.next_due);
          const days = daysUntil(item.next_due);
          return (
            <Card key={item.id} style={[styles.schedCard, overdue && styles.overdueCard]}>
              <Card.Title
                title={item.task_name}
                subtitle={
                  overdue
                    ? `OVERDUE by ${Math.abs(days)} days`
                    : `Due in ${days} days (${formatDate(item.next_due)})`
                }
                subtitleStyle={overdue ? styles.overdueText : undefined}
                right={() => (
                  <Chip
                    compact
                    style={{
                      marginRight: 12,
                      backgroundColor: overdue ? '#FFEBEE' : '#E8F5E9',
                    }}
                    textStyle={{
                      fontSize: 11,
                      color: overdue ? '#D32F2F' : '#1B5E20',
                    }}
                  >
                    {item.priority}
                  </Chip>
                )}
              />
            </Card>
          );
        })}

        {schedule.length === 0 && (
          <Text variant="bodyMedium" style={styles.emptyText}>
            No maintenance schedule configured.
          </Text>
        )}

        {/* Maintenance History */}
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent History
        </Text>

        {history.map((entry) => (
          <Card key={entry.id} style={styles.historyCard}>
            <Card.Title
              title={entry.task_type}
              subtitle={`${formatDate(entry.completed_at)}${entry.technician ? ` - ${entry.technician}` : ''}`}
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name="check-circle"
                  size={24}
                  color="#4CAF50"
                />
              )}
            />
            {entry.description && (
              <Card.Content>
                <Text variant="bodySmall" style={styles.historyDesc}>
                  {entry.description}
                </Text>
              </Card.Content>
            )}
          </Card>
        ))}

        {history.length === 0 && (
          <Text variant="bodyMedium" style={styles.emptyText}>
            No maintenance history yet.
          </Text>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  infoText: {
    flex: 1,
  },
  equipName: {
    fontWeight: 'bold',
  },
  equipModel: {
    color: '#666',
  },
  detail: {
    color: '#888',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  actionButton: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  schedCard: {
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  overdueCard: {
    backgroundColor: '#FFF8E1',
  },
  overdueText: {
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  historyCard: {
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  historyDesc: {
    color: '#666',
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
});
