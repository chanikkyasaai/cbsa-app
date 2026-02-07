import React, { createContext, useContext, useRef } from 'react';
import { BehavioralCollector } from './BehavioralCollector';

type BehavioralCtx = {
  collector: BehavioralCollector | null;
};

const Context = createContext<BehavioralCtx>({ collector: null });

export function BehavioralProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<BehavioralCollector | null>(null);

  if (!ref.current) {
    ref.current = new BehavioralCollector(payload => {
      fetch('http://localhost:3001/behavior', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {
        console.log(payload);
      });
    });

    ref.current.start();
  }

  return (
    <Context.Provider value={{ collector: ref.current }}>
      {children}
    </Context.Provider>
  );
}

export function useBehavioralCollector() {
  return useContext(Context).collector;
}