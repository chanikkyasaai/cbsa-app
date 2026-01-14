import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform, NativeSyntheticEvent, NativeScrollEvent, GestureResponderEvent, TextInput, Dimensions } from 'react-native';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import * as Device from 'expo-device';
import * as Battery from 'expo-battery';

// Helper functions for statistics
const calculateMean = (data: number[]) => data.reduce((a, b) => a + b, 0) / (data.length || 1);
const calculateVariance = (data: number[], mean: number) => {
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
};
const calculateMagnitude = (x: number, y: number, z: number) => Math.sqrt(x * x + y * y + z * z);
const calculateEntropy = (data: number[]) => {
  if (data.length === 0) return 0;
  const histogram: Record<string, number> = {};
  data.forEach(val => {
    const bin = Math.floor(val * 2); // Binning (0.5 granularity)
    histogram[bin] = (histogram[bin] || 0) + 1;
  });
  let entropy = 0;
  Object.values(histogram).forEach(count => {
    const p = count / data.length;
    entropy -= p * Math.log2(p);
  });
  return entropy;
};

export default function BehavioralDataScreen() {
  // Sensor Data State
  const [accelData, setAccelData] = useState({ x: 0, y: 0, z: 0 });
  const [gyroData, setGyroData] = useState({ x: 0, y: 0, z: 0 });

  // Touch Data State
  const [touchData, setTouchData] = useState({ x: 0, y: 0, count: 0 });

  // Device & Battery State
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [deviceInfo, setDeviceInfo] = useState({
    model: '',
    osVersion: '',
  });

  // Derived Features State
  const [touchFeatures, setTouchFeatures] = useState({
    dwellTime: 0,
    velocity: 0,
    direction: 0,
    pressure: 0,
  });
  const [scrollFeatures, setScrollFeatures] = useState({
    velocity: 0,
    acceleration: 0,
    direction: 'None',
  });
  const [accelFeatures, setAccelFeatures] = useState({
    magnitude: 0,
    mean: 0,
    variance: 0,
    entropy: 0,
  });
  const [gyroFeatures, setGyroFeatures] = useState({
    magnitude: 0,
    mean: 0,
    variance: 0,
    entropy: 0,
  });
  const [typingFeatures, setTypingFeatures] = useState({
    interKeyLatency: 0,
    typingSpeed: 0, // chars per minute approx
  });
  const [contextFeatures, setContextFeatures] = useState({
    orientation: 'Portrait',
    timeOfDay: new Date().toLocaleTimeString(),
  });

  // Buffers for sliding windows
  const accelBuffer = useRef<number[]>([]);
  const gyroBuffer = useRef<number[]>([]);
  const MAX_BUFFER_SIZE = 20; // ~2 seconds at 100ms interval

  // Interaction Refs
  const touchStartRef = useRef<{ time: number; x: number; y: number } | null>(null);
  const lastScrollRef = useRef<{ time: number; y: number; velocity: number } | null>(null);
  const lastKeyTimeRef = useRef<number>(0);

  // Sensors Subscription
  useEffect(() => {
    Accelerometer.setUpdateInterval(100);
    Gyroscope.setUpdateInterval(100);

    const accelSubscription = Accelerometer.addListener(data => {
      setAccelData(data);
      
      // Derived Accel Features
      const mag = calculateMagnitude(data.x, data.y, data.z);
      accelBuffer.current.push(mag);
      if (accelBuffer.current.length > MAX_BUFFER_SIZE) accelBuffer.current.shift();
      
      const mean = calculateMean(accelBuffer.current);
      const variance = calculateVariance(accelBuffer.current, mean);
      const entropy = calculateEntropy(accelBuffer.current);
      
      setAccelFeatures({ magnitude: mag, mean, variance, entropy });
    });

    const gyroSubscription = Gyroscope.addListener(data => {
      setGyroData(data);

      // Derived Gyro Features
      const mag = calculateMagnitude(data.x, data.y, data.z);
      gyroBuffer.current.push(mag);
      if (gyroBuffer.current.length > MAX_BUFFER_SIZE) gyroBuffer.current.shift();

      const mean = calculateMean(gyroBuffer.current);
      const variance = calculateVariance(gyroBuffer.current, mean);
      const entropy = calculateEntropy(gyroBuffer.current);

      setGyroFeatures({ magnitude: mag, mean, variance, entropy });
    });

    // Context: Orientation & Time
    const updateContext = () => {
      const dim = Dimensions.get('window');
      setContextFeatures({
        orientation: dim.height >= dim.width ? 'Portrait' : 'Landscape',
        timeOfDay: new Date().toLocaleTimeString(),
      });
    };
    
    const dimSubscription = Dimensions.addEventListener('change', updateContext);
    const timeInterval = setInterval(updateContext, 1000);

    return () => {
      accelSubscription && accelSubscription.remove();
      gyroSubscription && gyroSubscription.remove();
      dimSubscription && dimSubscription.remove();
      clearInterval(timeInterval);
    };
  }, []);

  // Battery & Device Info
  useEffect(() => {
    const fetchDeviceData = async () => {
      let level = null;
      try {
        level = await Battery.getBatteryLevelAsync();
      } catch (e) {
        console.log('Battery level not available');
      }
      setBatteryLevel(level);

      setDeviceInfo({
        model: Device.modelName || 'Unknown',
        osVersion: Device.osVersion || 'Unknown',
      });
    };

    fetchDeviceData();

    const batterySubscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
      setBatteryLevel(batteryLevel);
    });

    return () => {
      batterySubscription && batterySubscription.remove();
    };
  }, []);

  // Touch Handlers
  const handleTouchStart = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    const timestamp = Date.now();
    touchStartRef.current = { time: timestamp, x: pageX, y: pageY };

    setTouchData(prev => ({
      x: pageX,
      y: pageY,
      count: prev.count + 1,
    }));
  };

  const handleTouchEnd = (event: GestureResponderEvent) => {
    if (!touchStartRef.current) return;
    
    const { pageX, pageY, force } = event.nativeEvent;
    const timestamp = Date.now();
    const startTime = touchStartRef.current.time;
    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;

    const dt = timestamp - startTime; // ms
    const dx = pageX - startX;
    const dy = pageY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const velocity = dt > 0 ? distance / dt : 0; // pixels/ms
    const direction = Math.atan2(dy, dx) * (180 / Math.PI); // degrees

    setTouchFeatures({
      dwellTime: dt,
      velocity: velocity * 1000, // pixels/sec
      direction,
      pressure: force || 0,
    });
    
    touchStartRef.current = null;
  };

  // Scroll Handler
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset } = event.nativeEvent;
    const now = Date.now();
    const currentY = contentOffset.y;

    if (lastScrollRef.current) {
      const dt = now - lastScrollRef.current.time;
      const dy = currentY - lastScrollRef.current.y;
      
      if (dt > 0) {
        const velocity = dy / dt; // pixels/ms
        const prevVelocity = lastScrollRef.current.velocity;
        const acceleration = (velocity - prevVelocity) / dt; // pixels/ms^2

        setScrollFeatures({
          velocity: Math.abs(velocity * 1000), // pixels/sec
          acceleration: acceleration * 1000000, // scaled for readability
          direction: dy > 0 ? 'Down' : dy < 0 ? 'Up' : 'None',
        });
        
        lastScrollRef.current = { time: now, y: currentY, velocity };
        return;
      }
    }

    lastScrollRef.current = { time: now, y: currentY, velocity: 0 };
  };

  // Typing Handler
  const handleTextChange = (text: string) => {
    const now = Date.now();
    if (lastKeyTimeRef.current > 0) {
      const latency = now - lastKeyTimeRef.current;
      setTypingFeatures({
        interKeyLatency: latency,
        typingSpeed: latency > 0 ? 60000 / latency : 0, // approx chars/min
      });
    }
    lastKeyTimeRef.current = now;
  };

  const round = (n: number) => (n ? n.toFixed(3) : '0.000');

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <Text style={styles.header}>Behavioral Data Capture</Text>

        {/* Accelerometer Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Accelerometer (Raw)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>X: {round(accelData.x)}</Text>
            <Text style={styles.label}>Y: {round(accelData.y)}</Text>
            <Text style={styles.label}>Z: {round(accelData.z)}</Text>
          </View>
        </View>

        {/* Gyroscope Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gyroscope (Raw)</Text>
          <View style={styles.row}>
            <Text style={styles.label}>X: {round(gyroData.x)}</Text>
            <Text style={styles.label}>Y: {round(gyroData.y)}</Text>
            <Text style={styles.label}>Z: {round(gyroData.z)}</Text>
          </View>
        </View>

        {/* Touch Interaction Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Touch Interaction (Raw)</Text>
          <Text style={styles.text}>Count: {touchData.count}</Text>
          <Text style={styles.text}>Last X: {touchData.x.toFixed(1)}</Text>
          <Text style={styles.text}>Last Y: {touchData.y.toFixed(1)}</Text>
        </View>

        {/* Derived Features Header */}
        <Text style={styles.sectionHeader}>Derived Behavioral Features</Text>

        {/* Touch Patterns */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Touch Patterns</Text>
          <Text style={styles.text}>Dwell Time: {touchFeatures.dwellTime.toFixed(0)} ms</Text>
          <Text style={styles.text}>Velocity: {touchFeatures.velocity.toFixed(0)} px/s</Text>
          <Text style={styles.text}>Direction: {touchFeatures.direction.toFixed(1)}°</Text>
          <Text style={styles.text}>Pressure: {touchFeatures.pressure.toFixed(3)}</Text>
        </View>

        {/* Scroll Behaviour */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Scroll Behaviour</Text>
          <Text style={styles.text}>Velocity: {scrollFeatures.velocity.toFixed(0)} px/s</Text>
          <Text style={styles.text}>Acceleration: {scrollFeatures.acceleration.toFixed(2)}</Text>
          <Text style={styles.text}>Direction: {scrollFeatures.direction}</Text>
        </View>

        {/* Typing Dynamics */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Typing Dynamics</Text>
          <TextInput 
            style={styles.input} 
            placeholder="Type here to test dynamics..." 
            onChangeText={handleTextChange}
          />
          <Text style={styles.text}>Inter-key Latency: {typingFeatures.interKeyLatency} ms</Text>
          <Text style={styles.text}>Approx Speed: {typingFeatures.typingSpeed.toFixed(0)} CPM</Text>
        </View>

        {/* Context Signals */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Context Signals</Text>
          <Text style={styles.text}>Orientation: {contextFeatures.orientation}</Text>
          <Text style={styles.text}>Time: {contextFeatures.timeOfDay}</Text>
        </View>

        {/* Accelerometer Derived */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Accel Derived (Window: 2s)</Text>
          <Text style={styles.text}>Magnitude: {round(accelFeatures.magnitude)}</Text>
          <Text style={styles.text}>Mean Mag: {round(accelFeatures.mean)}</Text>
          <Text style={styles.text}>Variance: {accelFeatures.variance.toFixed(5)}</Text>
          <Text style={styles.text}>Entropy: {accelFeatures.entropy.toFixed(3)}</Text>
        </View>

        {/* Gyroscope Derived */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Gyro Derived (Window: 2s)</Text>
          <Text style={styles.text}>Magnitude: {round(gyroFeatures.magnitude)}</Text>
          <Text style={styles.text}>Mean Mag: {round(gyroFeatures.mean)}</Text>
          <Text style={styles.text}>Variance: {gyroFeatures.variance.toFixed(5)}</Text>
          <Text style={styles.text}>Entropy: {gyroFeatures.entropy.toFixed(3)}</Text>
        </View>

        {/* Device Information Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Device Info</Text>
          <Text style={styles.text}>Model: {deviceInfo.model}</Text>
          <Text style={styles.text}>OS Version: {deviceInfo.osVersion}</Text>
          <Text style={styles.text}>
            Battery: {batteryLevel !== null ? (batteryLevel * 100).toFixed(0) + '%' : 'Loading...'}
          </Text>
        </View>

        <Text style={styles.footer}>Tap anywhere to update touch data</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    marginTop: 40,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#2c3e50',
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
    paddingBottom: 5,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#444',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#555',
  },
  text: {
    fontSize: 16,
    marginBottom: 6,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  footer: {
    textAlign: 'center',
    color: '#888',
    marginTop: 10,
    fontStyle: 'italic',
  },
});
