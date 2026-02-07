import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { BehavioralProvider } from '@/services/BehavioralContext';
import { behavioralService } from '@/services/BehavioralService';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      behavioralService.start();
    } else {
      behavioralService.stop();
    }
  }, [isLoggedIn]);

  let content = (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {isLoggedIn ? (
          // User is logged in - show all tabs
          <Stack.Screen name="(tabs)" options={{
            headerShown: true,
            headerTitle: 'Bank',
          }} />
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
        <Stack.Screen
          name="transaction/[id]"
          options={{
            presentation: 'modal',
            headerTitle: 'Transaction details',
            headerShown: true,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );

  return (
    isLoggedIn ?
      <BehavioralProvider>
        {content}
      </BehavioralProvider> : content 
  );
}

export default function RootLayout() {

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
