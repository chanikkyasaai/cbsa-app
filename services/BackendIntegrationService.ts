
interface BackendConfig {
  baseURL: string;
  retryAttempts?: number;
  vectorUploadIntervalMs?: number;
}

interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
}

/**
 * BackendIntegrationService - Handles backend communication
 * Coordinates with DataCollector for vector uploads
 */
export class BackendIntegrationService {
  private config: BackendConfig;
  private retryAttempts: number = 3;
  private uploadStats = {
    successCount: 0,
    failureCount: 0,
    totalUploaded: 0,
  };

  constructor(config: BackendConfig) {
    this.config = config;
    this.retryAttempts = config.retryAttempts || 3;
  }

  /**
   * Login to backend and validate PIN
   */
  async login(userId: string, pin: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.config.baseURL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, pin }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Login failed',
      };
    }
  }

  /**
   * Get upload statistics
   */
  getUploadStats() {
    return {
      successCount: this.uploadStats.successCount,
      failureCount: this.uploadStats.failureCount,
      totalUploaded: this.uploadStats.totalUploaded,
    };
  }

  /**
   * Get server status
   */
  async getServerStatus() {
    try {
      const response = await fetch(`${this.config.baseURL}/api/status`);
      return await response.json();
    } catch (error) {
      console.error('Status check failed:', error);
      return { running: false };
    }
  }
}

export default BackendIntegrationService;
