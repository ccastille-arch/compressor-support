import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { generateId } from '../../db/schema';
import { MAINTENANCE_TEMPLATES } from '../../data/maintenance-intervals';

export default function AddEquipmentScreen() {
  const router = useRouter();
  const { db } = useDatabase();
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('Ariel');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [location, setLocation] = useState('');
  const [installDate, setInstallDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!db) return;
    if (!name.trim() || !model.trim()) {
      Alert.alert('Required Fields', 'Please enter a name and model number.');
      return;
    }

    setSaving(true);
    try {
      const equipmentId = generateId();
      await db.runAsync(
        `INSERT INTO equipment (id, name, model, manufacturer, serial_number, location, install_date, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [equipmentId, name.trim(), model.trim(), manufacturer, serialNumber.trim() || null, location.trim() || null, installDate.trim() || null, notes.trim() || null]
      );

      // Auto-populate maintenance schedule from templates
      const template = MAINTENANCE_TEMPLATES.find(
        (t) => t.manufacturer === manufacturer
      );
      if (template) {
        for (const task of template.tasks) {
          const schedId = generateId();
          const nextDue = calculateNextDue(task.intervalDays, task.intervalHours);
          await db.runAsync(
            `INSERT INTO maintenance_schedule (id, equipment_id, task_name, interval_hours, interval_days, next_due, priority)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [schedId, equipmentId, task.name, task.intervalHours || null, task.intervalDays || null, nextDue, task.priority]
          );
        }
      }

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save equipment. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function calculateNextDue(days?: number, hours?: number): string {
    const now = new Date();
    if (days) {
      now.setDate(now.getDate() + days);
    } else if (hours) {
      // Default 8 running hours per day for initial estimate
      now.setDate(now.getDate() + Math.ceil(hours / 8));
    }
    return now.toISOString();
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Add Equipment' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text variant="titleMedium" style={styles.section}>
          Equipment Details
        </Text>

        <TextInput
          label="Unit Name *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Unit 1 - Well Pad A"
          outlineColor="#CCC"
          activeOutlineColor="#1B5E20"
        />

        <Text variant="bodyMedium" style={styles.label}>Manufacturer</Text>
        <SegmentedButtons
          value={manufacturer}
          onValueChange={setManufacturer}
          buttons={[
            { value: 'Ariel', label: 'Ariel' },
            { value: 'Dresser-Rand', label: 'Dresser-Rand' },
            { value: 'Other', label: 'Other' },
          ]}
          style={styles.segmented}
        />

        <TextInput
          label="Model *"
          value={model}
          onChangeText={setModel}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., JGC/2"
          outlineColor="#CCC"
          activeOutlineColor="#1B5E20"
        />

        <TextInput
          label="Serial Number"
          value={serialNumber}
          onChangeText={setSerialNumber}
          mode="outlined"
          style={styles.input}
          outlineColor="#CCC"
          activeOutlineColor="#1B5E20"
        />

        <TextInput
          label="Location"
          value={location}
          onChangeText={setLocation}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Permian Basin - Pad 7"
          outlineColor="#CCC"
          activeOutlineColor="#1B5E20"
        />

        <TextInput
          label="Install Date"
          value={installDate}
          onChangeText={setInstallDate}
          mode="outlined"
          style={styles.input}
          placeholder="YYYY-MM-DD"
          outlineColor="#CCC"
          activeOutlineColor="#1B5E20"
        />

        <TextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={3}
          outlineColor="#CCC"
          activeOutlineColor="#1B5E20"
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
          buttonColor="#1B5E20"
          contentStyle={styles.saveButtonContent}
        >
          Save Equipment
        </Button>
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
    paddingBottom: 40,
  },
  section: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  label: {
    marginBottom: 6,
    color: '#666',
  },
  segmented: {
    marginBottom: 12,
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
});
