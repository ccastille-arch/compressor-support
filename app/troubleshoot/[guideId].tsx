import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Surface, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useState, useMemo } from 'react';
import { TROUBLESHOOT_GUIDES, TroubleshootNode } from '../../data/troubleshooting-guides';

export default function TroubleshootGuideScreen() {
  const { guideId } = useLocalSearchParams<{ guideId: string }>();
  const router = useRouter();
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const guide = useMemo(
    () => TROUBLESHOOT_GUIDES.find((g) => g.id === guideId),
    [guideId]
  );

  if (!guide) {
    return (
      <View style={styles.container}>
        <Text>Guide not found</Text>
      </View>
    );
  }

  const nodeId = currentNodeId || guide!.startNode;
  const node = guide!.nodes[nodeId];

  function goToNode(nextId: string) {
    setHistory((prev) => [...prev, nodeId]);
    setCurrentNodeId(nextId);
  }

  function goBack() {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setCurrentNodeId(prev);
    }
  }

  function restart() {
    setHistory([]);
    setCurrentNodeId(guide!.startNode);
  }

  return (
    <>
      <Stack.Screen options={{ title: guide!.title }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Progress indicator */}
        <View style={styles.progressRow}>
          <Text variant="bodySmall" style={styles.progressText}>
            Step {history.length + 1}
          </Text>
          {history.length > 0 && (
            <Button compact mode="text" onPress={goBack} textColor="#1B5E20">
              Back
            </Button>
          )}
        </View>

        {/* Node content */}
        <Surface style={styles.nodeCard} elevation={2}>
          {node.type === 'result' ? (
            <MaterialCommunityIcons
              name="check-circle"
              size={48}
              color="#1B5E20"
              style={styles.resultIcon}
            />
          ) : (
            <MaterialCommunityIcons
              name="help-circle"
              size={48}
              color="#FF6F00"
              style={styles.resultIcon}
            />
          )}

          <Text variant="titleLarge" style={styles.nodeTitle}>
            {node.text}
          </Text>

          {node.detail && (
            <>
              <Divider style={styles.divider} />
              <Text variant="bodyMedium" style={styles.nodeDetail}>
                {node.detail}
              </Text>
            </>
          )}
        </Surface>

        {/* Action buttons */}
        {node.type === 'question' && (
          <View style={styles.buttonRow}>
            <Button
              mode="contained"
              onPress={() => node.yesNext && goToNode(node.yesNext)}
              style={[styles.answerButton, styles.yesButton]}
              buttonColor="#1B5E20"
              icon="check"
              contentStyle={styles.buttonContent}
            >
              Yes
            </Button>
            <Button
              mode="contained"
              onPress={() => node.noNext && goToNode(node.noNext)}
              style={[styles.answerButton, styles.noButton]}
              buttonColor="#D32F2F"
              icon="close"
              contentStyle={styles.buttonContent}
            >
              No
            </Button>
          </View>
        )}

        {node.type === 'action' && node.next && (
          <Button
            mode="contained"
            onPress={() => goToNode(node.next!)}
            style={styles.nextButton}
            buttonColor="#1B5E20"
          >
            Continue
          </Button>
        )}

        {node.type === 'result' && (
          <View style={styles.resultActions}>
            <Button
              mode="contained"
              onPress={restart}
              style={styles.restartButton}
              buttonColor="#1B5E20"
              icon="restart"
            >
              Start Over
            </Button>
            <Button
              mode="outlined"
              onPress={() => router.back()}
              style={styles.doneButton}
              textColor="#1B5E20"
            >
              Done
            </Button>
          </View>
        )}
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
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressText: {
    color: '#666',
  },
  nodeCard: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  resultIcon: {
    marginBottom: 16,
  },
  nodeTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    lineHeight: 28,
  },
  divider: {
    width: '100%',
    marginVertical: 16,
  },
  nodeDetail: {
    lineHeight: 22,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 24,
  },
  answerButton: {
    flex: 1,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  yesButton: {},
  noButton: {},
  nextButton: {
    marginTop: 24,
    borderRadius: 8,
  },
  resultActions: {
    marginTop: 24,
    gap: 12,
  },
  restartButton: {
    borderRadius: 8,
  },
  doneButton: {
    borderRadius: 8,
    borderColor: '#1B5E20',
  },
});
