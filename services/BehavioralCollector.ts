import { Accelerometer, Gyroscope } from "expo-sensors";
import { SigningService } from "./SigningService";

type Vec3 = { x: number; y: number; z: number };

export type EmittedBehavioralPayload = {
  payload: {
    timestamp: number;
    nonce: string;
    vector: number[];
  };
  signature: string;
};

export class BehavioralCollector {
  private accel: Vec3[] = [];
  private gyro: Vec3[] = [];
  private touches: { x: number; y: number; t: number }[] = [];
  private scrolls: { dy: number; t: number }[] = [];
  private keys: number[] = [];

  private windowMs = 2000;
  private timer: any;

  constructor(private onEmit?: (data: EmittedBehavioralPayload) => void) {
    Accelerometer.setUpdateInterval(50);
    Gyroscope.setUpdateInterval(50);

    Accelerometer.addListener(d => this.accel.push(d));
    Gyroscope.addListener(d => this.gyro.push(d));
  }

  /* ───── UI HOOKS ───── */

  recordTouchStart(x: number, y: number) {
    this.touches.push({ x, y, t: Date.now() });
  }

  recordTouchEnd(x: number, y: number) {
    this.touches.push({ x, y, t: Date.now() });
  }

  recordScroll(dy: number) {
    this.scrolls.push({ dy, t: Date.now() });
  }

  recordKeystroke() {
    this.keys.push(Date.now());
  }

  /* ───── CONTROL ───── */

  async start() {
    await SigningService.init();

    this.timer = setInterval(async () => {
      const payload = await this.emitVector();
      this.onEmit?.(payload);
      this.reset();
    }, this.windowMs);
  }

  stop() {
    clearInterval(this.timer);
  }

  /* ───── FINAL EMISSION ───── */

  private async emitVector() {
    const vector = this.extract48D();

    const payload = {
      timestamp: Date.now(),
      nonce: cryptoRandom(),
      vector
    };

    const signature = await SigningService.sign(payload);

    return {
      payload,
      signature
    };
  }

  /* ───── FEATURE EXTRACTION ───── */

  private extract48D(): number[] {
    const v: number[] = [];

    // 1–6 Touch
    v.push(
      ...this.lastTouch(),
      this.touches.length,
      this.deltaTime(this.touches),
      this.touchType(),
      this.touches.length
    );

    // 7–9 Accel
    v.push(...this.meanVec(this.accel));

    // 10–12 Gyro
    v.push(...this.meanVec(this.gyro));

    // 13–16 Context
    v.push(1, 1, 1, 0.5);

    // 17–24 Touch behavior
    v.push(
      ...this.touchStats()
    );

    // 25–30 Accel dynamics
    v.push(...this.motionStats(this.accel));

    // 31–36 Gyro dynamics
    v.push(...this.motionStats(this.gyro));

    // 37–40 Scroll
    v.push(...this.scrollStats());

    // 41–44 Temporal
    v.push(
      this.interEvent(),
      this.rhythm(),
      this.entropy(this.magnitudes(this.accel)),
      this.stability(this.magnitudes(this.accel))
    );

    // 45–48 Reserved
    while (v.length < 48) v.push(0);

    return v.map(normalize);
  }

  /* ───── MATH HELPERS ───── */

  private mean(a: number[]) {
    return a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
  }

  private variance(a: number[]) {
    const m = this.mean(a);
    return this.mean(a.map(v => (v - m) ** 2));
  }

  private std(a: number[]) {
    return Math.sqrt(this.variance(a));
  }

  private magnitudes(v: Vec3[]) {
    return v.map(x => Math.sqrt(x.x ** 2 + x.y ** 2 + x.z ** 2));
  }

  private meanVec(v: Vec3[]) {
    return [
      this.mean(v.map(x => x.x)),
      this.mean(v.map(x => x.y)),
      this.mean(v.map(x => x.z))
    ];
  }

  private motionStats(v: Vec3[]) {
    const m = this.magnitudes(v);
    return [
      m.at(-1) || 0,
      this.mean(m),
      this.variance(m),
      this.std(m),
      this.energy(m),
      this.peaks(m)
    ];
  }

  private energy(a: number[]) {
    return a.reduce((s, v) => s + v * v, 0);
  }

  private peaks(a: number[]) {
    const m = this.mean(a);
    return a.filter(v => Math.abs(v - m) > 0.5).length;
  }

  private entropy(a: number[]) {
    if (!a.length) return 0;
    const bins: Record<number, number> = {};
    a.forEach(v => (bins[Math.floor(v)] = (bins[Math.floor(v)] || 0) + 1));
    return Object.values(bins).reduce((s, c) => {
      const p = c / a.length;
      return s - p * Math.log2(p);
    }, 0);
  }

  private lastTouch() {
    const t = this.touches.at(-1);
    return t ? [t.x, t.y] : [0, 0];
  }

  private touchStats() {
    const d = this.touches.map((t, i, a) =>
      i ? Math.hypot(t.x - a[i - 1].x, t.y - a[i - 1].y) : 0
    );
    return [
      this.mean(d),
      this.std(d),
      Math.max(...d, 0),
      d.length,
      this.entropy(d),
      this.sum(d),
      this.touches.length,
      this.mean(d)
    ];
  }

  private scrollStats() {
    const s = this.scrolls.map(s => s.dy);
    return [
      this.mean(s),
      this.variance(s),
      Math.max(...s, 0),
      this.pauseTime()
    ];
  }

  private pauseTime() {
    if (this.scrolls.length < 2) return 0;
    const a = this.scrolls;
    return a[a.length - 1].t - a[a.length - 2].t;
  }

  private interEvent() {
    return this.keys.length > 1
      ? this.keys.at(-1)! - this.keys[0]
      : 0;
  }

  private rhythm() {
    return this.std(
      this.keys.map((k, i) => i ? k - this.keys[i - 1] : 0)
    );
  }

  private stability(a: number[]) {
    return 1 / (1 + this.variance(a));
  }

  private deltaTime(a: { t: number }[]) {
    return a.length > 1 ? a[a.length - 1].t - a[0].t : 0;
  }

  private touchType() {
    return this.touches.length > 1 ? 1 : 0;
  }

  private sum(a: number[]) {
    return a.reduce((s, v) => s + v, 0);
  }

  private reset() {
    this.accel = [];
    this.gyro = [];
    this.touches = [];
    this.scrolls = [];
    this.keys = [];
  }
}

/* ───── Utilities ───── */

const normalize = (v: number) =>
  Math.max(0, Math.min(1, (v + 10) / 20));

const cryptoRandom = () =>
  Math.random().toString(36).slice(2);
