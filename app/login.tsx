import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from './AuthContext';
import { behavioralService } from '@/services/BehavioralService';
import { router } from 'expo-router';

interface PINKeypadKey {
  value: string;
  label: string;
}

export default function LoginScreen() {
  const { login } = useAuth();
  const [pin, setPin] = useState('');
  const [keypadSequence, setKeypadSequence] = useState<PINKeypadKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generateRandomizedKeypad();
  }, []);

  // Generate randomized keypad (0-9 in random order)
  const generateRandomizedKeypad = () => {
    const digits = Array.from({ length: 10 }, (_, i) => ({
      value: i.toString(),
      label: i.toString(),
    }));

    for (let i = digits.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [digits[i], digits[j]] = [digits[j], digits[i]];
    }

    setKeypadSequence(digits);
  };

  // Handle PIN key press
  const handlePinKeyPress = (digit: string, event: any) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);

      const collector = behavioralService.getCollector();
      if (collector && event?.nativeEvent) {
        const { pageX, pageY } = event.nativeEvent;
        collector.recordTouchStart(pageX, pageY);
        collector.recordKeystroke();
      }
    }
  };

  // Handle backspace
  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));

    behavioralService.getCollector()?.recordKeystroke();
  };

  // Handle clear
  const handleClear = () => {
    setPin('');

    behavioralService.getCollector()?.recordKeystroke();
  };

  const handleProceed = async () => {
    if (pin.length !== 4) {
      Alert.alert('Error', 'PIN must be 4 digits');
      return;
    }

    setIsLoading(true);

    try {
      // Simulated login success
      await new Promise(res => setTimeout(res, 800));

      Alert.alert('Success', 'Login successful!');
      login(); // triggers isLoggedIn = true
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Login failed. Please try again.');
      setPin('');
    } finally {
      setIsLoading(false);
    }
  };

  const getKeypadRow = (start: number) => keypadSequence.slice(start, start + 3);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ThemedView style={styles.container}>
        <View style={styles.mainContent}>
          <View style={styles.headerContainer}>
            <ThemedText style={styles.title}>Enter login PIN</ThemedText>
          </View>

          <View style={styles.pinDisplayContainer}>
            <View style={styles.pinDisplay}>
              {Array.from({ length: 4 }).map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.pinDot,
                    {
                      backgroundColor:
                        index < pin.length ? '#2D3436' : 'transparent',
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.keypadContainer}>
            {[0, 3, 6].map(start => (
              <View key={start} style={styles.keypadRow}>
                {getKeypadRow(start).map((key, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.keypadButton,
                      { opacity: isLoading || pin.length >= 4 ? 0.5 : 1 },
                    ]}
                    onPress={(event) => handlePinKeyPress(key.value, event)}
                    disabled={isLoading || pin.length >= 4}
                  >
                    <Text style={styles.keypadButtonText}>{key.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <View style={styles.keypadRow}>
              <TouchableOpacity
                style={[
                  styles.keypadButton,
                  { opacity: isLoading || pin.length === 0 ? 0.5 : 1 },
                ]}
                onPress={handleBackspace}
                disabled={isLoading || pin.length === 0}
              >
                <Text style={styles.keypadButtonText}>←</Text>
              </TouchableOpacity>

              {keypadSequence.length > 0 && (
                <TouchableOpacity
                  style={[
                    styles.keypadButton,
                    { opacity: isLoading || pin.length >= 4 ? 0.5 : 1 },
                  ]}
                  onPress={(event) =>
                    handlePinKeyPress(keypadSequence[9].value, event)
                  }
                  disabled={isLoading || pin.length >= 4}
                >
                  <Text style={styles.keypadButtonText}>
                    {keypadSequence[9].label}
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.keypadButton, { opacity: isLoading ? 0.5 : 1 }]}
                onPress={handleClear}
                disabled={isLoading}
              >
                <Text style={styles.clearButtonText}>CLEAR</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.proceedButton,
              { opacity: isLoading || pin.length !== 4 ? 0.5 : 1 },
            ]}
            onPress={handleProceed}
            disabled={isLoading || pin.length !== 4}
          >
            <Text style={styles.proceedButtonText}>
              {isLoading ? 'Processing...' : 'PROCEED'}
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8E8EC',
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: '#5B5B63',
    letterSpacing: 0.3,
  },
  pinDisplayContainer: {
    marginBottom: 30,
    alignItems: 'center',
    backgroundColor: '#D5D5D8',
    borderRadius: 35,
    paddingVertical: 25,
    paddingHorizontal: 50,
  },
  pinDisplay: {
    flexDirection: 'row',
    gap: 25,
  },
  pinDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: '#5B5B63',
  },
  keypadContainer: {
    width: '100%',
    maxWidth: 320,
  },
  keypadRow: {
    flexDirection: 'row',
    marginBottom: 0,
    gap: 0,
  },
  keypadButton: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#D5D5D8',
    borderWidth: 0.5,
    borderColor: '#BFBFBF',
  },
  keypadButtonText: {
    fontSize: 32,
    fontWeight: '400',
    color: '#2D3436',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#5B5B63',
    letterSpacing: 0.5,
  },
  proceedButton: {
    marginTop: 30,
    width: '100%',
    maxWidth: 320,
    paddingVertical: 14,
    backgroundColor: '#2D3436',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  proceedButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
});
