import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { useBehavioralCollector } from '@/services/BehavioralContext';
import { router } from 'expo-router';


const collector = useBehavioralCollector();

const TRANSACTIONS = [
  { id: '1', name: 'Amazon', amount: -1299, date: 'Today, 14:32', status: 'Completed' },
  { id: '2', name: 'Rahul', amount: 5000, date: 'Yesterday, 09:10', status: 'Completed' },
  { id: '3', name: 'Uber', amount: -240, date: 'Sep 12, 21:18', status: 'Completed' },
  { id: '4', name: 'Netflix', amount: -499, date: 'Sep 10, 08:00', status: 'Pending' },
  { id: '5', name: 'Swiggy', amount: -620, date: 'Sep 9, 20:45', status: 'Completed' },
];

export default function ActivityScreen() {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return TRANSACTIONS;
    return TRANSACTIONS.filter(tx =>
      tx.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search transactions"
        style={styles.search}
        value={query}
        onChangeText={(s) => {
          collector?.recordKeystroke()
          setQuery(s)
        }}
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.txRow}
            onPress={() => router.push('/transaction/1')}
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
            <View>
              <Text style={styles.txName}>{item.name}</Text>
              <Text style={styles.txDate}>{item.date}</Text>
            </View>
            <View style={styles.txRight}>
              <Text
                style={[
                  styles.txAmount,
                  { color: item.amount < 0 ? '#C0392B' : '#27AE60' },
                ]}
              >
                {item.amount < 0 ? '-' : '+'}₹{Math.abs(item.amount)}
              </Text>
              <Text style={styles.txStatus}>{item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA', padding: 16 },
  search: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  txName: { fontSize: 15, fontWeight: '500' },
  txDate: { fontSize: 12, color: '#7F8C8D', marginTop: 2 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 15, fontWeight: '600' },
  txStatus: { fontSize: 11, color: '#7F8C8D', marginTop: 2 },
});
