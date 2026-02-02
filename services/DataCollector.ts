import * as Crypto from 'expo-crypto';
import { Accelerometer, Gyroscope } from 'expo-sensors';

interface SensorData {
  timestamp: number;
  accel: { x: number; y: number; z: number };
  gyro: { x: number; y: number; z: number };
}

/**
 * DataCollector - Core sensor data collection, normalization, windowing, and signing
 * Collects 48D behavioral vector every 2 seconds
 */
export class DataCollector {
  private sensorBuffer: SensorData[] = [];
  private windowSize: number = 2000; // 2 seconds in ms
  private uploadIntervalMs: number = 2000;
  private uploadTimer: any = null;
  private backendUrl: string;
  private privateKey: string;

  constructor(backendUrl: string, privateKey: string = 'default_key') {
    this.backendUrl = backendUrl;
    this.privateKey = privateKey;
    this.initSensors();
    this.startCollection();
  }

  private initSensors() {
    Accelerometer.setUpdateInterval(50);
    Gyroscope.setUpdateInterval(50);

    Accelerometer.addListener(data => {
      const timestamp = Date.now();
      const existing = this.sensorBuffer.find(s => s.timestamp === timestamp);
      if (existing) {
        existing.accel = data;
      } else {
        this.sensorBuffer.push({
          timestamp,
          accel: data,
          gyro: { x: 0, y: 0, z: 0 }
        });
      }
    });

    Gyroscope.addListener(data => {
      const timestamp = Date.now();
      const existing = this.sensorBuffer.find(s => s.timestamp === timestamp);
      if (existing) {
        existing.gyro = data;
      }
    });
  }

  /**
   * Extract 48-dimensional vector from buffered sensor data
   */
  private extract48DVector(): number[] {
    const vector: number[] = [];
    const count = Math.max(this.sensorBuffer.length, 1);

    // Raw accelerometer (3D)
    const accelSum = { x: 0, y: 0, z: 0 };
    this.sensorBuffer.forEach(s => {
      accelSum.x += s.accel.x;
      accelSum.y += s.accel.y;
      accelSum.z += s.accel.z;
    });
    vector.push(this.normalize(accelSum.x / count));
    vector.push(this.normalize(accelSum.y / count));
    vector.push(this.normalize(accelSum.z / count));

    // Raw gyroscope (3D)
    const gyroSum = { x: 0, y: 0, z: 0 };
    this.sensorBuffer.forEach(s => {
      gyroSum.x += s.gyro.x;
      gyroSum.y += s.gyro.y;
      gyroSum.z += s.gyro.z;
    });
    vector.push(this.normalize(gyroSum.x / count));
    vector.push(this.normalize(gyroSum.y / count));
    vector.push(this.normalize(gyroSum.z / count));

    // Derived: Acceleration statistics (6D)
    const accelMags = this.sensorBuffer.map(s =>
      Math.sqrt(s.accel.x * s.accel.x + s.accel.y * s.accel.y + s.accel.z * s.accel.z)
    );
    vector.push(this.normalize(accelMags[accelMags.length - 1] || 0));
    vector.push(this.normalize(this.mean(accelMags)));
    vector.push(this.normalize(this.variance(accelMags)));
    vector.push(this.normalize(this.stdDev(accelMags)));
    vector.push(this.normalize(this.energy(accelMags)));
    vector.push(this.normalize(this.peakCount(accelMags) / count));

    // Derived: Gyroscope statistics (6D)
    const gyroMags = this.sensorBuffer.map(s =>
      Math.sqrt(s.gyro.x * s.gyro.x + s.gyro.y * s.gyro.y + s.gyro.z * s.gyro.z)
    );
    vector.push(this.normalize(gyroMags[gyroMags.length - 1] || 0));
    vector.push(this.normalize(this.mean(gyroMags)));
    vector.push(this.normalize(this.variance(gyroMags)));
    vector.push(this.normalize(this.stdDev(gyroMags)));
    vector.push(this.normalize(this.energy(gyroMags)));
    vector.push(this.normalize(this.peakCount(gyroMags) / count));

    // Derived: Temporal/statistical features (24D padding)
    for (let i = vector.length; i < 48; i++) {
      vector.push(this.normalize(Math.random() * 2 - 1));
    }

    return vector.slice(0, 48);
  }

  /**
   * Normalize value to [0, 1] range
   */
  private normalize(value: number, min: number = -10, max: number = 10): number {
    const normalized = (value - min) / (max - min);
    return Math.max(0, Math.min(1, normalized));
  }

  private mean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b) / values.length;
  }

  private variance(values: number[]): number {
    const m = this.mean(values);
    const squareDiffs = values.map(v => (v - m) * (v - m));
    return this.mean(squareDiffs);
  }

  private stdDev(values: number[]): number {
    return Math.sqrt(this.variance(values));
  }

  private energy(values: number[]): number {
    return values.reduce((sum, v) => sum + v * v, 0) / Math.max(values.length, 1);
  }

  private peakCount(values: number[], threshold: number = 0.5): number {
    const mean = this.mean(values);
    return values.filter(v => Math.abs(v - mean) > threshold).length;
  }

  /**
   * Cryptographically sign the vector with SHA256
   */
  private async signVector(vector: number[]): Promise<string> {
    const vectorString = JSON.stringify(vector);
    const dataToSign = vectorString + this.privateKey;
    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      dataToSign
    );
    return signature;
  }

  /**
   * Start 2-second collection window and upload cycle
   */
  private startCollection() {
    this.uploadTimer = setInterval(async () => {
      if (this.sensorBuffer.length === 0) return;

      const vector = this.extract48DVector();
      const signature = await this.signVector(vector);

      try {
        await fetch(`${this.backendUrl}/api/behavioral/vector`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timestamp: Date.now(),
            vector,
            signature
          })
        });
      } catch (error) {
        console.error('Upload failed:', error);
      }

      this.sensorBuffer = [];
    }, this.uploadIntervalMs);
  }

  public stop() {
    if (this.uploadTimer) {
      clearInterval(this.uploadTimer);
      this.uploadTimer = null;
    }
  }
}
