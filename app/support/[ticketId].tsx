import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Card, Text, TextInput, Button, Chip, Divider, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, Stack, useFocusEffect } from 'expo-router';
import { useState, useCallback, useRef } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { generateId } from '../../db/schema';

interface TicketDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
  synced: number;
}

interface Message {
  id: string;
  sender: string;
  message: string;
  created_at: string;
  synced: number;
}

const priorityColors: Record<string, string> = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
  critical: '#9C27B0',
};

export default function TicketDetailScreen() {
  const { ticketId } = useLocalSearchParams<{ ticketId: string }>();
  const { db, isReady } = useDatabase();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const loadData = useCallback(async () => {
    if (!db || !ticketId) return;
    try {
      const t = await db.getFirstAsync<TicketDetail>(
        'SELECT * FROM tickets WHERE id = ?',
        [ticketId]
      );
      setTicket(t);

      const msgs = await db.getAllAsync<Message>(
        'SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY created_at ASC',
        [ticketId]
      );
      setMessages(msgs);
    } catch {
      // ignore
    }
  }, [db, ticketId]);

  useFocusEffect(
    useCallback(() => {
      if (isReady) loadData();
    }, [isReady, loadData])
  );

  async function sendMessage() {
    if (!db || !ticketId || !newMessage.trim()) return;

    setSending(true);
    try {
      const msgId = generateId();
      await db.runAsync(
        `INSERT INTO ticket_messages (id, ticket_id, sender, message, synced)
         VALUES (?, ?, ?, ?, 0)`,
        [msgId, ticketId, 'Technician', newMessage.trim()]
      );
      setNewMessage('');
      await loadData();
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  if (!ticket) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: ticket.title }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={88}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          contentContainerStyle={styles.content}
        >
          {/* Ticket Info */}
          <Surface style={styles.infoCard} elevation={1}>
            <Text variant="titleMedium" style={styles.ticketTitle}>
              {ticket.title}
            </Text>
            <View style={styles.chipRow}>
              <Chip
                compact
                style={{ backgroundColor: (priorityColors[ticket.priority] || '#999') + '20' }}
                textStyle={{ color: priorityColors[ticket.priority] || '#999', fontSize: 11 }}
              >
                {ticket.priority.toUpperCase()}
              </Chip>
              <Chip compact style={styles.statusChip} textStyle={styles.statusText}>
                {ticket.status.toUpperCase()}
              </Chip>
              <Chip compact icon="tag" style={styles.catChip} textStyle={styles.catText}>
                {ticket.category}
              </Chip>
            </View>
            <Text variant="bodyMedium" style={styles.ticketDesc}>
              {ticket.description}
            </Text>
            <Text variant="bodySmall" style={styles.dateText}>
              Created {formatDate(ticket.created_at)}
            </Text>
          </Surface>

          <Divider style={styles.divider} />

          {/* Messages */}
          <Text variant="titleSmall" style={styles.messagesTitle}>
            Messages ({messages.length})
          </Text>

          {messages.map((msg) => (
            <Surface
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === 'Technician' ? styles.myMessage : styles.theirMessage,
              ]}
              elevation={1}
            >
              <Text variant="labelSmall" style={styles.senderName}>
                {msg.sender}
              </Text>
              <Text variant="bodyMedium">{msg.message}</Text>
              <View style={styles.messageFooter}>
                <Text variant="bodySmall" style={styles.messageDate}>
                  {formatDate(msg.created_at)}
                </Text>
                {!msg.synced && (
                  <MaterialCommunityIcons name="cloud-off-outline" size={14} color="#E65100" />
                )}
              </View>
            </Surface>
          ))}

          {messages.length === 0 && (
            <Text variant="bodyMedium" style={styles.noMessages}>
              No messages yet. Start the conversation below.
            </Text>
          )}
        </ScrollView>

        {/* Message input */}
        <Surface style={styles.inputBar} elevation={3}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            mode="outlined"
            style={styles.messageInput}
            outlineColor="#CCC"
            activeOutlineColor="#1B5E20"
            dense
          />
          <Button
            mode="contained"
            onPress={sendMessage}
            loading={sending}
            disabled={sending || !newMessage.trim()}
            buttonColor="#1B5E20"
            compact
            icon="send"
            contentStyle={styles.sendContent}
          >
            {''}
          </Button>
        </Surface>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 20,
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  ticketTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  statusChip: {
    backgroundColor: '#E3F2FD',
  },
  statusText: {
    color: '#1565C0',
    fontSize: 11,
  },
  catChip: {
    backgroundColor: '#F3E5F5',
  },
  catText: {
    color: '#6A1B9A',
    fontSize: 11,
  },
  ticketDesc: {
    marginTop: 4,
    lineHeight: 20,
    color: '#333',
  },
  dateText: {
    marginTop: 8,
    color: '#999',
  },
  divider: {
    marginVertical: 16,
  },
  messagesTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    maxWidth: '85%',
  },
  myMessage: {
    backgroundColor: '#E8F5E9',
    alignSelf: 'flex-end',
  },
  theirMessage: {
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  senderName: {
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 2,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  messageDate: {
    color: '#999',
    fontSize: 11,
  },
  noMessages: {
    textAlign: 'center',
    color: '#999',
    padding: 20,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  sendContent: {
    paddingVertical: 4,
  },
});
