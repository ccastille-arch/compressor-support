import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons } from 'react-native-paper';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useDatabase } from '../../hooks/useDatabase';
import { generateId } from '../../db/schema';
import { TASK_CATEGORIES } from '../../data/maintenance-intervals';

export default function LogEntryScreen() {
  const router = useRouter();
  const { equipmentId, equipmentName } = useLocalSearchParams<{
    equipmentId: string;
    equipmentName: string;
  }>();
  const { db } = useDatabase();

  const [taskType, setTaskType] = useState('');
  const [description, setDescription] = useState('');
  const [technician, setTechnician] = useState('');
  const [hoursReading, setHoursReading] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      setPhotos((prev) => [...prev, ...result.assets.map((a: ImagePicker.ImagePickerAsset) => a.uri)]);
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera access is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  }

  async function handleSave() {
    if (!db || !equipmentId) return;
    if (!taskType.trim() || !description.trim()) {
      Alert.alert('Required Fields', 'Please enter a task type and description.');
      return;
    }

    setSaving(true);
    try {
      await db.runAsync(
        `INSERT INTO maintenance_log (id, equipment_id, task_type, description, technician, hours_reading, parts_replaced, notes, photos)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generateId(),
          equipmentId,
          taskType.trim(),
          description.trim(),
          technician.trim() || null,
          hoursReading ? parseFloat(hoursReading) : null,
          partsReplaced.trim() || null,
          notes.trim() || null,
          photos.length > 0 ? JSON.stringify(photos) : null,
        ]
      );

      // Update schedule next_due if matching task
      await db.runAsync(
        `UPDATE maintenance_schedule
         SET last_completed = datetime('now'),
             next_due = CASE
               WHEN interval_days IS NOT NULL THEN datetime('now', '+' || interval_days || ' days')
               WHEN interval_hours IS NOT NULL THEN datetime('now', '+' || (interval_hours / 8) || ' days')
               ELSE next_due
             END
         WHERE equipment_id = ? AND task_name LIKE ?`,
        [equipmentId, `%${taskType}%`]
      );

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save log entry.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: `Log - ${equipmentName || 'Maintenance'}` }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TextInput
          label="Task Type *"
          value={taskType}
          onChangeText={setTaskType}
          mode="outlined"
          style={styles.input}
          placeholder="e.g., Valve Inspection, Oil Change"
          outlineColor="#CCC"
          activeOutlineColor="#1B5E20"
        />

        <TextInput
          label="Description *"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={4}
          placeholder="Describe the work performed..."
          outlineColor="#CCC"
          activeOutlineColor="#1B5E20"
        />

        <TextInput
          label="Technician Name"
          value={technician}
          onChangeText={setTechnician}
          mode="outlined"
          style={styles.input}
          outlineColor="#CCC"
          activeOutlineColor="#1B5E20"
        />

        <TextInput
          label="Hours Reading"
          value={hoursReading}
          onChangeText={setHoursReading}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
          placeholder="Current compressor running hours"
          outlineColor="#CCC"
          activeOutlineColor="#1B5E20"
        />

        <TextInput
          label="Parts Replaced"
          value={partsReplaced}
          onChangeText={setPartsReplaced}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={2}
          placeholder="List parts replaced (if any)"
          outlineColor="#CCC"
          activeOutlineColor="#1B5E20"
        />

        <TextInput
          label="Additional Notes"
          value={notes}
          onChangeText={setNotes}
          mode="outlined"
          style={styles.input}
          multiline
          numberOfLines={3}
          outlineColor="#CCC"
          activeOutlineColor="#1B5E20"
        />

        {/* Photo section */}
        <Text variant="titleSmall" style={styles.photoTitle}>
          Photos ({photos.length})
        </Text>
        <View style={styles.photoButtons}>
          <Button mode="outlined" icon="camera" onPress={takePhoto} textColor="#1B5E20" style={styles.photoBtn}>
            Camera
          </Button>
          <Button mode="outlined" icon="image" onPress={pickImage} textColor="#1B5E20" style={styles.photoBtn}>
            Gallery
          </Button>
        </View>

        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
          buttonColor="#1B5E20"
          contentStyle={styles.saveButtonContent}
        >
          Save Log Entry
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
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  photoTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  photoBtn: {
    flex: 1,
    borderColor: '#1B5E20',
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 8,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
});
