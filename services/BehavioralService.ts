import { BehavioralCollector } from './BehavioralCollector';
import { BackendIntegrationService } from './BackendIntegrationService';

class BehavioralService {
  private collector: BehavioralCollector | null = null;
  private backend: BackendIntegrationService | null = null;

  start() {
    if (this.collector) return;

    this.backend = new BackendIntegrationService({
      baseURL: 'http://localhost:3001',
      retryAttempts: 3,
      vectorUploadIntervalMs: 2000,
    });

    this.collector = new BehavioralCollector((data) => {
      console.log("behavioral data: ", data);
    });

    this.collector.start();
  }

  stop() {
    this.collector?.stop();
    this.collector = null;
    this.backend = null;
  }

  getCollector() {
    return this.collector;
  }
}

export const behavioralService = new BehavioralService();
