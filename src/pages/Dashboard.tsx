import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import TransactionExample from '../components/TransactionExample';
import ProtectedRoute from '../components/ProtectedRoute';

const Dashboard: React.FC = () => {
  const { 
    walletAddress, 
    logout, 
    jwt, 
    zkProof, 
    generateZkProof, 
    isLoading,
    userSalt,
    maxEpoch 
  } = useAuth();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  };

  const truncateJwt = (token: string) => {
    return `${token.slice(0, 20)}...${token.slice(-20)}`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-900 text-white">
        {/* Header */}
        <header className="bg-black/95 backdrop-blur-md border-b border-yellow-500/10 sticky top-0 z-50">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <span className="text-yellow-400 mr-2 text-2xl">₿</span>
                <h1 className="text-2xl font-bold text-white">BTCLend Dashboard</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right hidden sm:block">
                  <p className="text-white/60 text-sm">Wallet</p>
                  <p className="text-yellow-400 font-mono text-sm">
                    {walletAddress ? truncateAddress(walletAddress) : 'Not connected'}
                  </p>
                </div>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              Welcome to your Secure Wallet! 🎉
            </h2>
            <p className="text-white/70">
              Your zkLogin authentication is active and your wallet is ready to use.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Account Information */}
            <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-yellow-500/20 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">🔐 Account Information</h3>
              
              <div className="space-y-4">
                {/* Wallet Address */}
                <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">Wallet Address</h4>
                  <div className="font-mono text-sm text-white bg-black/30 p-3 rounded-lg break-all">
                    {walletAddress}
                  </div>
                  <p className="text-white/60 text-xs mt-2">
                    Short: {walletAddress ? truncateAddress(walletAddress) : 'N/A'}
                  </p>
                </div>

                {/* Authentication Status */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <h4 className="text-green-400 font-semibold mb-2">Authentication Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">JWT Token:</span>
                      <span className="text-green-400">✅ Valid</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">ZK Proof:</span>
                      <span className={zkProof ? "text-green-400" : "text-yellow-400"}>
                        {zkProof ? "✅ Generated" : "⏳ Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Max Epoch:</span>
                      <span className="text-white">{maxEpoch}</span>
                    </div>
                  </div>
                </div>

                {/* JWT Token Details */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <h4 className="text-blue-400 font-semibold mb-2">JWT Token</h4>
                  <div className="font-mono text-xs text-white/80 bg-black/30 p-3 rounded-lg break-all">
                    {jwt ? truncateJwt(jwt) : 'No token'}
                  </div>
                </div>

                {/* Generate ZK Proof Button */}
                {!zkProof && (
                  <button
                    onClick={generateZkProof}
                    disabled={isLoading}
                    className={`w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 ${
                      isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3 inline-block" />
                        Generating ZK Proof...
                      </>
                    ) : (
                      '🔐 Generate ZK Proof'
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Transaction Examples */}
            <TransactionExample />
          </div>

          {/* Features Grid */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-yellow-500/20">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center text-black font-bold text-xl mb-4">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Secure Authentication</h3>
              <p className="text-white/70">
                Zero-knowledge proof authentication ensures your privacy while maintaining security on the Sui blockchain.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-yellow-500/20">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">
                ⚡
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Fast Transactions</h3>
              <p className="text-white/70">
                Execute transactions seamlessly with zkLogin signatures, providing both speed and security.
              </p>
            </div>

            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-yellow-500/20">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl mb-4">
                🌐
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Sui Integration</h3>
              <p className="text-white/70">
                Full integration with the Sui blockchain ecosystem for DeFi and beyond.
              </p>
            </div>
          </div>

          {/* Technical Details */}
          <div className="mt-12 bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-yellow-500/20">
            <h3 className="text-2xl font-bold text-white mb-6">🔧 Technical Implementation</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-yellow-400 font-semibold mb-3">zkLogin Flow</h4>
                <ol className="space-y-2 text-sm text-white/80">
                  <li>1. Generate ephemeral keypair and randomness</li>
                  <li>2. Create nonce for Google OAuth</li>
                  <li>3. Authenticate with Google and receive JWT</li>
                  <li>4. Derive wallet address from JWT and salt</li>
                  <li>5. Generate ZK proof for transactions</li>
                  <li>6. Execute transactions with zkLogin signature</li>
                </ol>
              </div>
              
              <div>
                <h4 className="text-yellow-400 font-semibold mb-3">Security Features</h4>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>• Zero-knowledge proof authentication</li>
                  <li>• Ephemeral key management</li>
                  <li>• Google OAuth integration</li>
                  <li>• Non-custodial wallet control</li>
                  <li>• Multi-signature support</li>
                  <li>• Epoch-based key rotation</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;