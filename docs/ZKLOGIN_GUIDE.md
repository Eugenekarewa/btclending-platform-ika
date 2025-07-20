# zkLogin Authentication Guide

This guide explains how to use the zkLogin authentication system in your BTCLend application.

## Overview

zkLogin is a privacy-preserving authentication method that allows users to authenticate with their Google accounts while maintaining anonymity on the Sui blockchain. This implementation provides a complete authentication flow with wallet creation and transaction signing capabilities.

## Features

- 🔐 **Zero-Knowledge Authentication**: Authenticate with Google without revealing your identity on-chain
- 🌐 **Google OAuth Integration**: Seamless login with existing Google accounts
- 🛡️ **Non-Custodial Wallets**: Full control over your wallet and private keys
- ⚡ **Fast Transactions**: Execute transactions with zkLogin signatures
- 🔄 **Session Management**: Persistent authentication across browser sessions
- 🎯 **Sui Blockchain Integration**: Full compatibility with Sui ecosystem

## Architecture

### Components

1. **useZkLogin Hook** (`src/hooks/useZkLogin.ts`)
   - Core authentication logic
   - Wallet address derivation
   - ZK proof generation
   - Transaction execution

2. **AuthContext** (`src/contexts/AuthContext.tsx`)
   - Global authentication state management
   - React context for sharing auth state

3. **Login/Signup Components** (`src/Auth/`)
   - User-friendly authentication interfaces
   - Google OAuth integration

4. **ProtectedRoute Component** (`src/components/ProtectedRoute.tsx`)
   - Route protection for authenticated users
   - Automatic redirects for unauthenticated access

5. **Dashboard** (`src/pages/Dashboard.tsx`)
   - Main authenticated user interface
   - Account information and transaction examples

## Usage

### Basic Setup

1. **Wrap your app with AuthProvider**:
```tsx
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

2. **Use the authentication hook**:
```tsx
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { 
    walletAddress, 
    loginWithGoogle, 
    logout, 
    isAuthenticated,
    isLoading 
  } = useAuth();

  // Component logic
}
```

### Authentication Flow

#### 1. Login Process
```tsx
const { loginWithGoogle } = useAuth();

const handleLogin = async () => {
  try {
    await loginWithGoogle();
    // User will be redirected to Google OAuth
    // After successful auth, they'll return to your app
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

#### 2. Generate ZK Proof
```tsx
const { generateZkProof, zkProof } = useAuth();

const handleGenerateProof = async () => {
  if (!zkProof) {
    await generateZkProof();
  }
};
```

#### 3. Execute Transactions
```tsx
import { Transaction } from '@mysten/sui/transactions';

const { executeTransaction } = useAuth();

const handleTransaction = async () => {
  const tx = new Transaction();
  
  // Add your transaction logic
  const [coin] = tx.splitCoins(tx.gas, [100000000]); // 0.1 SUI
  tx.transferObjects([coin], walletAddress);

  const result = await executeTransaction(tx);
  console.log('Transaction result:', result);
};
```

### Protected Routes

Protect routes that require authentication:

```tsx
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}
```

## Configuration

### Environment Variables

Configure the following in your environment:

```env
# Google OAuth Client ID
VITE_GOOGLE_CLIENT_ID=your-google-client-id

# Sui Network Configuration
VITE_SUI_NETWORK=devnet
VITE_SUI_RPC_URL=https://fullnode.devnet.sui.io

# ZK Proof Service
VITE_ZK_PROVER_URL=https://prover-dev.mystenlabs.com/v1
```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your redirect URIs:
   - `http://localhost:3000/Login` (development)
   - `https://yourdomain.com/Login` (production)

## Security Considerations

### Data Storage

- **Session Storage**: Ephemeral keys (cleared on browser close)
- **Local Storage**: User salt and max epoch (persistent)
- **Memory Only**: JWT tokens and ZK proofs (not persisted)

### Best Practices

1. **Never store JWT tokens permanently**
2. **Regenerate ephemeral keys for each session**
3. **Validate epoch bounds before transactions**
4. **Use secure random generation for salts**
5. **Implement proper error handling**

## API Reference

### useZkLogin Hook

```tsx
interface ZkLoginHook {
  // State
  walletAddress: string | null;
  jwt: string | null;
  zkProof: PartialZkLoginSignature | null;
  isLoading: boolean;
  
  // Authentication
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  
  // ZK Operations
  generateZkProof: () => Promise<PartialZkLoginSignature>;
  executeTransaction: (tx: Transaction) => Promise<any>;
  
  // Wallet Management
  createAndSetWallet: () => Promise<string>;
}
```

### Authentication Context

```tsx
interface AuthContextType extends ZkLoginHook {
  isAuthenticated: boolean;
}
```

## Troubleshooting

### Common Issues

1. **"Missing required parameters for ZK proof generation"**
   - Ensure user is logged in and has valid JWT
   - Check that ephemeral keys are generated

2. **"Transaction execution failed"**
   - Verify ZK proof is generated
   - Check wallet has sufficient gas
   - Validate transaction structure

3. **"Invalid JWT: missing sub or aud fields"**
   - Check Google OAuth configuration
   - Verify client ID matches OAuth setup

### Debug Mode

Enable debug logging:

```tsx
// In development
localStorage.setItem('zklogin_debug', 'true');
```

## Examples

### Complete Login Flow

```tsx
import { useAuth } from './contexts/AuthContext';

function LoginExample() {
  const { 
    loginWithGoogle, 
    walletAddress, 
    generateZkProof, 
    zkProof,
    isLoading 
  } = useAuth();

  const handleCompleteLogin = async () => {
    try {
      // Step 1: Authenticate with Google
      await loginWithGoogle();
      
      // Step 2: Generate ZK proof (after redirect back)
      if (walletAddress && !zkProof) {
        await generateZkProof();
      }
    } catch (error) {
      console.error('Login process failed:', error);
    }
  };

  return (
    <div>
      {!walletAddress ? (
        <button onClick={handleCompleteLogin} disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in with Google'}
        </button>
      ) : (
        <div>
          <p>Wallet: {walletAddress}</p>
          {!zkProof && (
            <button onClick={generateZkProof} disabled={isLoading}>
              {isLoading ? 'Generating proof...' : 'Generate ZK Proof'}
            </button>
          )}
          {zkProof && <p>✅ Ready for transactions!</p>}
        </div>
      )}
    </div>
  );
}
```

### Transaction Example

```tsx
import { Transaction } from '@mysten/sui/transactions';

function TransactionExample() {
  const { executeTransaction, walletAddress } = useAuth();

  const sendTransaction = async () => {
    const tx = new Transaction();
    
    // Split coins for transfer
    const [coin] = tx.splitCoins(tx.gas, [1000000]); // 0.001 SUI
    
    // Transfer to self (example)
    tx.transferObjects([coin], walletAddress);
    
    try {
      const result = await executeTransaction(tx);
      console.log('Success:', result.digest);
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  return (
    <button onClick={sendTransaction}>
      Send Test Transaction
    </button>
  );
}
```

## Migration Guide

### From Basic zkLogin to Full Implementation

If you're upgrading from a basic zkLogin setup:

1. **Update imports**:
   ```tsx
   // Old
   import { useZkLogin } from './hooks/useZkLogin';
   
   // New
   import { useAuth } from './contexts/AuthContext';
   ```

2. **Wrap app with AuthProvider**:
   ```tsx
   // Add AuthProvider at app root
   <AuthProvider>
     <App />
   </AuthProvider>
   ```

3. **Update component logic**:
   ```tsx
   // Old
   const { walletAddress, loginWithGoogle } = useZkLogin();
   
   // New
   const { walletAddress, loginWithGoogle, isAuthenticated } = useAuth();
   ```

## Support

For issues and questions:

1. Check the [troubleshooting section](#troubleshooting)
2. Review the [Sui zkLogin documentation](https://docs.sui.io/concepts/cryptography/zklogin)
3. Open an issue in the project repository

## License

This implementation is part of the BTCLend project and follows the same licensing terms.