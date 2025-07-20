import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useZkLogin } from '../hooks/useZkLogin';
import { api } from '../utils/api';

interface User {
  _id: string;
  email: string;
  name: string;
  picture?: string;
  suiWalletAddress: string;
  isVerified: boolean;
  createdAt: string;
  preferences: any;
}

interface AuthContextType {
  // User and auth state
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // zkLogin methods
  walletAddress: string | null;
  loginWithGoogle: () => Promise<void>;
  generateZkProof: () => Promise<any>;
  executeTransaction: (transaction: any) => Promise<any>;
  createAndSetWallet: () => Promise<string>;
  logout: () => void;
  
  // Backend auth methods
  authenticateWithBackend: () => Promise<void>;
  
  // zkLogin state
  jwt: string | null;
  ephemeralKeyPair: any;
  maxEpoch: number;
  nonce: string | null;
  randomness: string | null;
  userSalt: string | null;
  zkProof: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const zkLogin = useZkLogin();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing authentication on app load
  useEffect(() => {
    checkExistingAuth();
  }, []);

  // Check if user is already authenticated
  const checkExistingAuth = async () => {
    try {
      const { accessToken } = api.getTokens();
      if (accessToken) {
        const response = await api.auth.getProfile();
        setUser(response.data.user);
      }
    } catch (error) {
      console.log('No existing auth found');
      api.clearTokens();
    } finally {
      setIsLoading(false);
    }
  };

  // Authenticate with backend after zkLogin
  const authenticateWithBackend = async () => {
    if (!zkLogin.walletAddress || !zkLogin.jwt || !zkLogin.userSalt) {
      throw new Error('Missing zkLogin data for backend authentication');
    }

    try {
      const response = await api.auth.zkLogin({
        jwt: zkLogin.jwt,
        walletAddress: zkLogin.walletAddress,
        userSalt: zkLogin.userSalt,
        maxEpoch: zkLogin.maxEpoch,
      });

      // Store tokens
      api.setTokens(response.data.accessToken, response.data.refreshToken);
      
      // Set user data
      setUser(response.data.user);
      
      return response.data;
    } catch (error) {
      console.error('Backend authentication failed:', error);
      throw error;
    }
  };

  // Enhanced logout that clears backend tokens
  const logout = () => {
    zkLogin.logout();
    setUser(null);
    api.clearTokens();
  };

  const isAuthenticated = Boolean(user && zkLogin.walletAddress && zkLogin.jwt);

  const contextValue: AuthContextType = {
    // User and auth state
    user,
    isAuthenticated,
    isLoading: isLoading || zkLogin.isLoading,
    
    // zkLogin methods and state
    ...zkLogin,
    logout,
    
    // Backend auth methods
    authenticateWithBackend,
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