import { Stack } from 'expo-router';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { DatabaseProvider } from '../hooks/useDatabase';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1B5E20',
    primaryContainer: '#C8E6C9',
    secondary: '#FF6F00',
    secondaryContainer: '#FFE0B2',
    surface: '#FFFFFF',
    background: '#F5F5F5',
    error: '#D32F2F',
  },
};

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <DatabaseProvider>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: '#1B5E20' },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: { fontWeight: 'bold' },
            }}
          >
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="troubleshoot/[guideId]"
              options={{ title: 'Troubleshoot' }}
            />
            <Stack.Screen
              name="maintenance/[equipmentId]"
              options={{ title: 'Equipment Detail' }}
            />
            <Stack.Screen
              name="maintenance/add-equipment"
              options={{ title: 'Add Equipment' }}
            />
            <Stack.Screen
              name="maintenance/log-entry"
              options={{ title: 'Log Maintenance' }}
            />
            <Stack.Screen
              name="support/new-ticket"
              options={{ title: 'New Ticket' }}
            />
            <Stack.Screen
              name="support/[ticketId]"
              options={{ title: 'Ticket Detail' }}
            />
          </Stack>
        </DatabaseProvider>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
