import React, { createContext, useContext, ReactNode } from 'react';
import { useZkLogin } from '../hooks/useZkLogin';

interface AuthContextType {
  walletAddress: string | null;
  loginWithGoogle: () => Promise<void>;
  generateZkProof: () => Promise<any>;
  executeTransaction: (transaction: any) => Promise<any>;
  createAndSetWallet: () => Promise<string>;
  logout: () => void;
  jwt: string | null;
  ephemeralKeyPair: any;
  maxEpoch: number;
  nonce: string | null;
  randomness: string | null;
  userSalt: string | null;
  zkProof: any;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const zkLogin = useZkLogin();
  
  const isAuthenticated = Boolean(zkLogin.walletAddress && zkLogin.jwt);

  const contextValue: AuthContextType = {
    ...zkLogin,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;