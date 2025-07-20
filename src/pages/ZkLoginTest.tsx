import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const ZkLoginTest: React.FC = () => {
  const {
    walletAddress,
    loginWithGoogle,
    generateZkProof,
    logout,
    jwt,
    zkProof,
    isLoading,
    ephemeralKeyPair,
    randomness,
    userSalt,
    maxEpoch
  } = useAuth();

  const testEphemeralKey = () => {
    if (ephemeralKeyPair) {
      try {
        const exported = ephemeralKeyPair.export();
        console.log('Ephemeral key export successful:', exported.privateKey.substring(0, 10) + '...');
        
        // Test if we can recreate the keypair
        const recreated = Ed25519Keypair.fromSecretKey(exported.privateKey);
        console.log('Keypair recreation successful');
        
        return true;
      } catch (error) {
        console.error('Ephemeral key test failed:', error);
        return false;
      }
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">zkLogin Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Authentication Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
            <div className="space-y-2">
              <p><strong>Wallet:</strong> {walletAddress ? 'Connected' : 'Not connected'}</p>
              <p><strong>JWT:</strong> {jwt ? 'Present' : 'None'}</p>
              <p><strong>ZK Proof:</strong> {zkProof ? 'Generated' : 'Not generated'}</p>
              <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Technical Details</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Ephemeral Key:</strong> {ephemeralKeyPair ? 'Present' : 'None'}</p>
              <p><strong>Randomness:</strong> {randomness ? 'Present' : 'None'}</p>
              <p><strong>User Salt:</strong> {userSalt ? 'Present' : 'None'}</p>
              <p><strong>Max Epoch:</strong> {maxEpoch || 'Not set'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={loginWithGoogle}
                disabled={isLoading}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Login with Google'}
              </button>
              
              {walletAddress && !zkProof && (
                <button
                  onClick={generateZkProof}
                  disabled={isLoading}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {isLoading ? 'Generating...' : 'Generate ZK Proof'}
                </button>
              )}

              <button
                onClick={testEphemeralKey}
                className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
              >
                Test Ephemeral Key
              </button>

              <button
                onClick={logout}
                className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Wallet Info */}
          {walletAddress && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Wallet Information</h2>
              <div className="space-y-2 text-sm">
                <p><strong>Full Address:</strong></p>
                <p className="font-mono break-all bg-gray-100 p-2 rounded">{walletAddress}</p>
              </div>
            </div>
          )}
        </div>

        {/* Debug Information */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Session Storage:</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs">
                {JSON.stringify({
                  ephemeral_key: sessionStorage.getItem('ephemeral_key') ? 'Present' : 'None',
                  randomness: sessionStorage.getItem('randomness') ? 'Present' : 'None'
                }, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold">Local Storage:</h3>
              <pre className="bg-gray-100 p-2 rounded text-xs">
                {JSON.stringify({
                  user_salt: localStorage.getItem('user_salt') ? 'Present' : 'None',
                  max_epoch: localStorage.getItem('max_epoch') || 'None'
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZkLoginTest;