import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../AuthContext';

export default function ProfileScreen() {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>Venkat</Text>
        <Text style={styles.meta}>+91 ••••••4321</Text>
        <Text style={styles.meta}>venkat@email.com</Text>
      </View>

      <TouchableOpacity
        style={styles.item}
        onPress={() => router.push('/change-pin')}
      >
        <Text style={styles.itemText}>Change PIN</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.item, styles.logout]}
        onPress={logout}
      >
        <Text style={[styles.itemText, styles.logoutText]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F5F6FA' },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  name: { fontSize: 18, fontWeight: '600' },
  meta: { fontSize: 13, color: '#7F8C8D', marginTop: 4 },

  item: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  itemText: { fontSize: 15 },
  logout: { backgroundColor: '#FDEDEC' },
  logoutText: { color: '#C0392B', fontWeight: '500' },
});
