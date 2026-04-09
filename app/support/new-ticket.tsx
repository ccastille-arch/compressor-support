import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, SegmentedButtons, RadioButton } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useDatabase } from '../../hooks/useDatabase';
import { generateId } from '../../db/schema';

const CATEGORIES = [
  'Valve Issue',
  'Packing Leak',
  'Vibration',
  'Lubrication',
  'Controls',
  'Capacity',
  'Cooling',
  'Electrical',
  'Other',
];

export default function NewTicketScreen() {
  const router = useRouter();
  const { db } = useDatabase();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [priority, setPriority] = useState('medium');
  const [equipmentId, setEquipmentId] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<Array<{ id: string; name: string }>>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEquipment();
  }, [db]);

  async function loadEquipment() {
    if (!db) return;
    try {
      const results = await db.getAllAsync<{ id: string; name: string }>(
        'SELECT id, name FROM equipment ORDER BY name'
      );
      setEquipment(results);
    } catch {
      // ignore
    }
  }

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
      Alert.alert('Permission needed', 'Camera access is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
    }
  }

  async function handleSubmit() {
    if (!db) return;
    if (!title.trim() || !description.trim()) {
      Alert.alert('Required Fields', 'Please enter a title and description.');
      return;
    }

    setSaving(true);
    try {
      await db.runAsync(
        `INSERT INTO tickets (id, title, description, category, priority, equipment_id, photos, synced)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          generateId(),
          title.trim(),
          description.trim(),
          category,
          priority,
          equipmentId,
          photos.length > 0 ? JSON.stringify(photos) : null,
        ]
      );
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to create ticket.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'New Support Ticket' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TextInput
          label="Title *"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          placeholder="Brief description of the issue"
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
          numberOfLines={5}
          placeholder="Detailed description of the problem, symptoms, and what you've tried..."
          outlineColor="#CCC"
          activeOutlineColor="#1B5E20"
        />

        <Text variant="titleSmall" style={styles.sectionLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                mode={category === cat ? 'contained' : 'outlined'}
                onPress={() => setCategory(cat)}
                buttonColor={category === cat ? '#1B5E20' : undefined}
                textColor={category === cat ? '#FFFFFF' : '#1B5E20'}
                style={styles.categoryChip}
                compact
              >
                {cat}
              </Button>
            ))}
          </View>
        </ScrollView>

        <Text variant="titleSmall" style={styles.sectionLabel}>Priority</Text>
        <SegmentedButtons
          value={priority}
          onValueChange={setPriority}
          buttons={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'critical', label: 'Critical' },
          ]}
          style={styles.segmented}
        />

        {equipment.length > 0 && (
          <>
            <Text variant="titleSmall" style={styles.sectionLabel}>
              Related Equipment (optional)
            </Text>
            <RadioButton.Group
              onValueChange={setEquipmentId}
              value={equipmentId || ''}
            >
              {equipment.map((eq) => (
                <RadioButton.Item
                  key={eq.id}
                  label={eq.name}
                  value={eq.id}
                  style={styles.radioItem}
                />
              ))}
              <RadioButton.Item
                label="None"
                value=""
                style={styles.radioItem}
              />
            </RadioButton.Group>
          </>
        )}

        <Text variant="titleSmall" style={styles.sectionLabel}>
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
          onPress={handleSubmit}
          loading={saving}
          disabled={saving}
          style={styles.submitButton}
          buttonColor="#1B5E20"
          contentStyle={styles.submitContent}
        >
          Submit Ticket
        </Button>

        <Text variant="bodySmall" style={styles.offlineNote}>
          Tickets created offline will be submitted automatically when connected.
        </Text>
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
  sectionLabel: {
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 8,
  },
  categoryScroll: {
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 6,
  },
  categoryChip: {
    borderColor: '#1B5E20',
  },
  segmented: {
    marginBottom: 12,
  },
  radioItem: {
    backgroundColor: '#FFFFFF',
    marginBottom: 2,
    borderRadius: 4,
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
  submitButton: {
    borderRadius: 8,
  },
  submitContent: {
    paddingVertical: 8,
  },
  offlineNote: {
    textAlign: 'center',
    color: '#999',
    marginTop: 12,
  },
});
