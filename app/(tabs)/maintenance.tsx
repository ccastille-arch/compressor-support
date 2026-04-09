import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, FAB, Chip, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useDatabase } from '../../hooks/useDatabase';

interface Equipment {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  serial_number: string | null;
  location: string | null;
  overdue_count: number;
}

export default function MaintenanceScreen() {
  const router = useRouter();
  const { db, isReady } = useDatabase();
  const [equipment, setEquipment] = useState<Equipment[]>([]);

  const loadEquipment = useCallback(async () => {
    if (!db) return;
    try {
      const results = await db.getAllAsync<Equipment>(`
        SELECT e.*,
          COALESCE((SELECT COUNT(*) FROM maintenance_schedule ms
            WHERE ms.equipment_id = e.id AND ms.next_due < datetime('now')), 0) as overdue_count
        FROM equipment e
        ORDER BY e.name
      `);
      setEquipment(results);
    } catch {
      // DB not ready
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      if (isReady) loadEquipment();
    }, [isReady, loadEquipment])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={equipment}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => router.push(`/maintenance/${item.id}`)}
          >
            <Card.Title
              title={item.name}
              subtitle={`${item.manufacturer} ${item.model}${item.location ? ` - ${item.location}` : ''}`}
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name="engine"
                  size={36}
                  color="#1B5E20"
                />
              )}
              right={() =>
                item.overdue_count > 0 ? (
                  <Chip
                    icon="alert"
                    style={styles.overdueChip}
                    textStyle={styles.overdueText}
                  >
                    {item.overdue_count} overdue
                  </Chip>
                ) : (
                  <Chip icon="check" style={styles.okChip} textStyle={styles.okText}>
                    OK
                  </Chip>
                )
              }
            />
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="engine-off" size={64} color="#CCC" />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No Equipment Registered
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              Add your first compressor to start tracking maintenance
            </Text>
            <Button
              mode="contained"
              onPress={() => router.push('/maintenance/add-equipment')}
              style={styles.addButton}
              buttonColor="#1B5E20"
            >
              Add Equipment
            </Button>
          </View>
        }
      />
      {equipment.length > 0 && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => router.push('/maintenance/add-equipment')}
          color="#FFFFFF"
          customSize={56}
        />
      )}
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
  overdueChip: {
    backgroundColor: '#FFEBEE',
    marginRight: 12,
  },
  overdueText: {
    color: '#D32F2F',
    fontSize: 12,
  },
  okChip: {
    backgroundColor: '#E8F5E9',
    marginRight: 12,
  },
  okText: {
    color: '#1B5E20',
    fontSize: 12,
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
  addButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#1B5E20',
  },
});
