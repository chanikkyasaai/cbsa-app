import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function TransactionDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={styles.container}>
      <View style={styles.amountBox}>
        <Text style={styles.amount}>₹1,299</Text>
        <Text style={styles.status}>Completed</Text>
      </View>

      <View style={styles.section}>
        <Row label="Transaction ID" value={id} />
        <Row label="To" value="Amazon India Pvt Ltd" />
        <Row label="Bank" value="HDFC Bank" />
        <Row label="Date" value="Sep 12, 2024 • 14:32" />
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA', padding: 20 },
  amountBox: { marginBottom: 24 },
  amount: { fontSize: 28, fontWeight: '600' },
  status: { color: '#27AE60', marginTop: 4 },

  section: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
  },
  row: { marginBottom: 12 },
  label: { fontSize: 12, color: '#7F8C8D' },
  value: { fontSize: 15 },
});
