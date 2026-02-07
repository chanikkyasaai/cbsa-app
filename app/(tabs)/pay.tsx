import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useBehavioralCollector } from '@/services/BehavioralContext';

const collector = useBehavioralCollector();

export default function PayScreen() {
  const [step, setStep] = useState<1 | 2>(1);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {step === 1 ? 'Pay Someone' : 'Confirm Transfer'}
      </Text>

      {step === 1 && (
        <>
          <TextInput
            placeholder="Recipient name or UPI"
            style={styles.input}
            value={recipient}
            onChangeText={(s) => {
              collector?.recordKeystroke()
              setRecipient(s)
            }}
          />
          <TextInput
            placeholder="Amount"
            keyboardType="numeric"
            style={styles.input}
            value={amount}
            onChangeText={(s) => {
              collector?.recordKeystroke()
              setAmount(s)
            }}
          />
        </>
      )}

      {step === 2 && (
        <View style={styles.summary}>
          <Text>To: {recipient}</Text>
          <Text>Amount: ₹{amount}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => step === 1 ? setStep(2) : null}
        onPressIn={e =>
          collector?.recordTouchStart(
            e.nativeEvent.pageX,
            e.nativeEvent.pageY
          )
        }
        onPressOut={e =>
          collector?.recordTouchEnd(
            e.nativeEvent.pageX,
            e.nativeEvent.pageY
          )
        }
      >
        <Text style={styles.buttonText}>
          {step === 1 ? 'NEXT' : 'PAY'}
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
    marginBottom: 16,
  },
  summary: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#2D3436',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
