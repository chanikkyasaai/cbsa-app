import { useBehavioralCollector } from '@/services/BehavioralContext';
import { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AccountScreen() {
  const collector = useBehavioralCollector();
  const lastY = useRef(0);
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      scrollEventThrottle={16}
      onScroll={(e) => {
        const y = e.nativeEvent.contentOffset.y;
        const dy = y - lastY.current;
        lastY.current = y;
        collector?.recordScroll(dy);
      }}
    >
      <View style={styles.card}>
        <Text style={styles.name}>Venkat</Text>
        <Text style={styles.meta}>venkat@email.com</Text>
        <Text style={styles.meta}>Savings •••• 4821</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Available Balance</Text>
        <Text style={styles.value}>₹42,350.00</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cards</Text>
        <Text style={styles.item}>Visa Debit •••• 1934</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Deposits</Text>
        <Text style={styles.item}>Fixed Deposit • ₹1,00,000</Text>
        <Text style={styles.item}>RD • ₹5,000 / month</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#2D3436',
    borderRadius: 14,
    padding: 20,
    marginBottom: 24,
  },
  name: { color: '#FFF', fontSize: 18, fontWeight: '600' },
  meta: { color: '#DCDDE1', fontSize: 13, marginTop: 4 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  label: { fontSize: 13, color: '#7F8C8D' },
  value: { fontSize: 22, fontWeight: '600', marginTop: 6 },
  item: { fontSize: 14, marginBottom: 6 },
});
