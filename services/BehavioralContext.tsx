import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { BehavioralCollector, EmittedBehavioralPayload } from './BehavioralCollector';
import { wsService } from './WebSocketService';

type BehavioralCtx = {
  collector: BehavioralCollector | null;
  isConnected: boolean;
  sessionId: string;
};

const Context = createContext<BehavioralCtx>({ 
  collector: null, 
  isConnected: false,
  sessionId: '',
});

export function BehavioralProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<BehavioralCollector | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Set up WebSocket connection status callback
    wsService.onConnectionChange((connected) => {
      setIsConnected(connected);
      console.log('[BehavioralProvider] WebSocket connected:', connected);
    });

    // Set up message handler for server responses
    wsService.onMessage((data) => {
      if (data.status === 'error') {
        console.error('[BehavioralProvider] Server error:', data.message, data.errors);
      } else if (data.status === 'received') {
        console.log('[BehavioralProvider] Server acknowledged message:', data.message_id);
      }
    });

    // Connect to WebSocket
    wsService.connect().catch((error) => {
      console.error('[BehavioralProvider] Initial connection failed:', error);
    });

    // Cleanup on unmount
    return () => {
      wsService.disconnect();
    };
  }, []);

  if (!ref.current) {
    ref.current = new BehavioralCollector((payload: EmittedBehavioralPayload) => {
      console.log('[BehavioralProvider] Sending behavioral data');
      
      // Send via WebSocket
      const sent = wsService.sendBehavioralEvent(
        payload.payload.eventType || 'BEHAVIORAL_VECTOR',
        {
          timestamp: payload.payload.timestamp,
          nonce: payload.payload.nonce,
          vector: payload.payload.vector,
          deviceInfo: payload.payload.deviceInfo,
          signature: payload.signature,
        }
      );

      if (!sent) {
        console.log('[BehavioralProvider] Message queued (WebSocket not connected)');
      }
    });

    ref.current.start();
  }

  return (
    <Context.Provider value={{ 
      collector: ref.current, 
      isConnected,
      sessionId: wsService.getSessionId(),
    }}>
      {children}
    </Context.Provider>
  );
}

export function useBehavioralCollector() {
  return useContext(Context).collector;
}

export function useWebSocketStatus() {
  const ctx = useContext(Context);
  return {
    isConnected: ctx.isConnected,
    sessionId: ctx.sessionId,
  };
}