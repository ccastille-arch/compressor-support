import { View, StyleSheet, FlatList } from 'react-native';
import { Card, Text, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { TROUBLESHOOT_GUIDES, TROUBLESHOOT_CATEGORIES } from '../../data/troubleshooting-guides';

export default function TroubleshootScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuides = useMemo(() => {
    if (!searchQuery.trim()) return TROUBLESHOOT_GUIDES;
    const q = searchQuery.toLowerCase();
    return TROUBLESHOOT_GUIDES.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const categoryIcons: Record<string, string> = {};
  TROUBLESHOOT_CATEGORIES.forEach((c) => {
    categoryIcons[c.id] = c.icon;
  });

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search troubleshooting guides..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Diagnostic Guides
      </Text>

      <FlatList
        data={filteredGuides}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            style={styles.card}
            onPress={() => router.push(`/troubleshoot/${item.id}`)}
          >
            <Card.Title
              title={item.title}
              subtitle={item.description}
              left={(props) => (
                <MaterialCommunityIcons
                  {...props}
                  name={(categoryIcons[item.category] || 'wrench') as any}
                  size={36}
                  color="#1B5E20"
                />
              )}
              titleStyle={styles.cardTitle}
            />
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="magnify" size={48} color="#999" />
            <Text variant="bodyLarge" style={styles.emptyText}>
              No guides match your search
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  searchbar: {
    margin: 16,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    fontWeight: 'bold',
  },
  empty: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#999',
    marginTop: 8,
  },
});
