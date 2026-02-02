import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DataCollector } from '@/services/DataCollector';
import { AuthProvider, useAuth } from './AuthContext';
import { useEffect } from 'react';
import { behavioralService } from '@/services/BehavioralService';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      //behavioralService.start();
    } else {
      behavioralService.stop();
    }
  }, [isLoggedIn]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {isLoggedIn ? (
          // User is logged in - show all tabs
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          // User is not logged in - show only login tab
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
            }}
          />
        )}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
