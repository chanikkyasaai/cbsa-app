import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Pressable,
  GestureResponderEvent,
} from 'react-native';
import { useAuth } from '../AuthContext';
import { router } from 'expo-router';
import { useBehavioralCollector } from '@/services/BehavioralContext';

const collector = useBehavioralCollector();

type Transaction = {
  id: string;
  name: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending';
};

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', name: 'Amazon', amount: -1299, date: 'Today, 14:32', status: 'Completed' },
  { id: '2', name: 'Rahul', amount: 5000, date: 'Yesterday, 09:10', status: 'Completed' },
  { id: '3', name: 'Uber', amount: -240, date: 'Sep 12, 21:18', status: 'Completed' },
  { id: '4', name: 'Netflix', amount: -499, date: 'Sep 10, 08:00', status: 'Pending' },
  { id: '5', name: 'Swiggy', amount: -620, date: 'Sep 9, 20:45', status: 'Completed' },
];

export default function DashboardScreen() {
  const { isLoggedIn } = useAuth();
  const [showBalance, setShowBalance] = useState(true);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      scrollEventThrottle={16}
      onScroll={e =>
        collector?.recordScroll(e.nativeEvent.contentOffset.y)
      }
    >
      {/* ================= Account Summary (Anchor) ================= */}
      <Pressable
        style={styles.accountCard}
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
        onPress={() => router.push('/account')}
      >
        <Text style={styles.accountType}>Savings Account</Text>

        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceValue}>
          {isLoggedIn && showBalance ? '₹42,350.00' : '••••••'}
        </Text>

        <View style={styles.accountMeta}>
          <Text style={styles.metaText}>A/C •••• 4821</Text>
          <Text style={styles.metaText}>Updated just now</Text>
        </View>
      </Pressable>

      {/* ================= Primary Actions (CTAs) ================= */}
      <View style={styles.actionsGrid}>
        <PrimaryAction
          label="Pay / Transfer"
          onPress={() => router.push('/pay')}
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
        />
        <PrimaryAction label="Receive" />
        <PrimaryAction
          label="Change PIN"
          onPress={() => router.push('/change-pin')}
        />
        <PrimaryAction
          label={showBalance ? 'Hide Balance' : 'Show Balance'}
          onPress={() => setShowBalance(!showBalance)}
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
        />
      </View>

      {/* ================= Transaction History ================= */}
      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      <FlatList
        data={MOCK_TRANSACTIONS}
        keyExtractor={(item) => item.id}
        scrollEnabled={false} // ScrollView owns scrolling (infinite feel)
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
    </ScrollView>
  );
}

function PrimaryAction({
  label,
  onPress,
  onPressIn,
  onPressOut,
}: {
  label: string;
  onPress?: () => void;
  onPressIn?: (e: GestureResponderEvent) => void;
  onPressOut?: (e: GestureResponderEvent) => void;
}) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },

  /* ===== Account Summary ===== */
  accountCard: {
    backgroundColor: '#2D3436',
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
  },
  accountType: {
    color: '#B2BEC3',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceLabel: {
    color: '#B2BEC3',
    fontSize: 13,
  },
  balanceValue: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '600',
    marginVertical: 6,
  },
  accountMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metaText: {
    color: '#DCDDE1',
    fontSize: 12,
  },

  /* ===== Actions ===== */
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2D3436',
  },

  /* ===== Transactions ===== */
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  txName: {
    fontSize: 15,
    fontWeight: '500',
  },
  txDate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  txStatus: {
    fontSize: 11,
    color: '#7F8C8D',
    marginTop: 2,
  },
});
