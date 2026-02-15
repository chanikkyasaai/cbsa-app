import { NativeModules, Platform } from 'react-native';
import * as Crypto from 'expo-crypto';

const { CryptoModule } = NativeModules;

const IS_NATIVE_AVAILABLE = !!CryptoModule;

export class SigningService {
  static async init() {
    if (IS_NATIVE_AVAILABLE) {
      await CryptoModule.generateKeyIfNeeded();
    }
    // else: no-op in Expo Go
  }

  static async sign(data: object): Promise<string> {
    const serialized = JSON.stringify(data);

    if (IS_NATIVE_AVAILABLE) {
      return await CryptoModule.signPayload(serialized);
    }

    // Expo Go fallback (NOT secure, but deterministic)
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      serialized
    );
  }
}
