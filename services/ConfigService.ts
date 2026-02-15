/**
 * Runtime Configuration Service
 * Stores user-configured backend settings that are set at login time
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const CONFIG_KEY = 'cbsa_backend_config';

export interface BackendConfig {
  backendIP: string;
  backendPort: number;
}

const DEFAULT_CONFIG: BackendConfig = {
  backendIP: 'localhost',
  backendPort: 8000,
};

class ConfigService {
  private cachedConfig: BackendConfig | null = null;

  /**
   * Get the WebSocket URL based on configured backend IP
   */
  async getWebSocketURL(): Promise<string> {
    const config = await this.getConfig();
    return `ws://${config.backendIP}:${config.backendPort}/ws/behaviour`;
  }

  /**
   * Get the REST API URL based on configured backend IP
   */
  async getRestURL(): Promise<string> {
    const config = await this.getConfig();
    return `http://${config.backendIP}:${config.backendPort}`;
  }

  /**
   * Get current configuration
   */
  async getConfig(): Promise<BackendConfig> {
    // Return cached config if available
    if (this.cachedConfig !== null) {
      return this.cachedConfig;
    }

    try {
      const stored = await AsyncStorage.getItem(CONFIG_KEY);
      if (stored) {
        this.cachedConfig = JSON.parse(stored);
        return this.cachedConfig as BackendConfig;
      }
    } catch (error) {
      console.error('[ConfigService] Error reading config:', error);
    }

    // Return default if nothing stored
    return DEFAULT_CONFIG;
  }

  /**
   * Save configuration (called from login screen)
   */
  async setConfig(config: BackendConfig): Promise<void> {
    try {
      // Validate IP address format
      if (!this.isValidIP(config.backendIP)) {
        throw new Error('Invalid IP address format');
      }

      if (config.backendPort < 1 || config.backendPort > 65535) {
        throw new Error('Port must be between 1 and 65535');
      }

      await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      this.cachedConfig = config;
      console.log('[ConfigService] Config saved:', config);
    } catch (error) {
      console.error('[ConfigService] Error saving config:', error);
      throw error;
    }
  }

  /**
   * Clear configuration (for logout/reset)
   */
  async clearConfig(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CONFIG_KEY);
      this.cachedConfig = null;
      console.log('[ConfigService] Config cleared');
    } catch (error) {
      console.error('[ConfigService] Error clearing config:', error);
    }
  }

  /**
   * Check if backend is accessible
   */
  async testConnection(): Promise<boolean> {
    try {
      const restURL = await this.getRestURL();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(`${restURL}/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response.ok;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error('[ConfigService] Connection test failed:', error);
      return false;
    }
  }

  /**
   * Simple IP validation (basic format check)
   */
  private isValidIP(ip: string): boolean {
    // Allow localhost
    if (ip === 'localhost' || ip === '127.0.0.1') {
      return true;
    }

    // IPv4 format: xxx.xxx.xxx.xxx
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Regex.test(ip)) {
      return false;
    }

    // Check octets are 0-255
    const octets = ip.split('.').map(Number);
    return octets.every(octet => octet >= 0 && octet <= 255);
  }
}

export const configService = new ConfigService();
