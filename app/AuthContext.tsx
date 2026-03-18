import React, { createContext, useContext, useState } from 'react';

export type EnrollmentStatus = 'none' | 'enrolling' | 'enrolled';

interface AuthContextType {
  isLoggedIn: boolean;
  username: string | null;
  enrollmentStatus: EnrollmentStatus;
  secondsRemaining: number | null;
  login: (username: string, status: EnrollmentStatus, secondsRemaining?: number | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>('none');
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  const login = (
    uname: string,
    status: EnrollmentStatus,
    secs?: number | null,
  ) => {
    setUsername(uname);
    setEnrollmentStatus(status);
    setSecondsRemaining(secs ?? null);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    setEnrollmentStatus('none');
    setSecondsRemaining(null);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, username, enrollmentStatus, secondsRemaining, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
