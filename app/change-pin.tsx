import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useBehavioralCollector } from '@/services/BehavioralContext';

const collector = useBehavioralCollector();

export default function ChangePinScreen() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const handleNext = () => {
    if (step === 1) {
      if (oldPin.length !== 4) return Alert.alert('Invalid PIN');
      setStep(2);
    } else if (step === 2) {
      if (newPin.length !== 4 || newPin === oldPin)
        return Alert.alert('Invalid new PIN');
      setStep(3);
    } else {
      if (newPin !== confirmPin)
        return Alert.alert('PINs do not match');

      Alert.alert('Success', 'PIN changed successfully');
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {step === 1 && 'Enter Current PIN'}
        {step === 2 && 'Enter New PIN'}
        {step === 3 && 'Confirm New PIN'}
      </Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        secureTextEntry
        maxLength={4}
        value={step === 1 ? oldPin : step === 2 ? newPin : confirmPin}
        onChangeText={(s) => {
          collector?.recordKeystroke()
          step === 1 ? setOldPin(s) : step === 2 ? setNewPin(s) : setConfirmPin(s)
        }}
        
      />

      <TouchableOpacity style={styles.button} onPress={handleNext}>
        <Text style={styles.buttonText}>
          {step === 3 ? 'CONFIRM' : 'NEXT'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#F5F6FA' },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 20 },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 14,
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 8,
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#2D3436',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
