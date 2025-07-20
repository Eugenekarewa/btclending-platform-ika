import React, { useState } from 'react';
import { Transaction } from '@mysten/sui/transactions';
import { useAuth } from '../contexts/AuthContext';

const TransactionExample: React.FC = () => {
  const { 
    executeTransaction, 
    generateZkProof, 
    walletAddress, 
    zkProof,
    isLoading 
  } = useAuth();
  
  const [txResult, setTxResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimpleTransaction = async () => {
    if (!walletAddress) {
      setError('Wallet not connected');
      return;
    }

    try {
      setError(null);
      setTxResult(null);

      // Generate ZK proof if not already generated
      if (!zkProof) {
        await generateZkProof();
      }

      // Create a simple transaction (transfer 0.1 SUI to self as example)
      const tx = new Transaction();
      const [coin] = tx.splitCoins(tx.gas, [100000000]); // 0.1 SUI in MIST
      tx.transferObjects([coin], walletAddress);

      // Execute the transaction
      const result = await executeTransaction(tx);
      setTxResult(result);
      
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      console.error('Transaction error:', err);
    }
  };

  const handleCustomTransaction = async () => {
    if (!walletAddress) {
      setError('Wallet not connected');
      return;
    }

    try {
      setError(null);
      setTxResult(null);

      // Generate ZK proof if not already generated
      if (!zkProof) {
        await generateZkProof();
      }

      // Create a custom transaction
      const tx = new Transaction();
      
      // Example: Create a simple object on-chain
      tx.moveCall({
        target: '0x2::object::new',
        arguments: [tx.pure.address(walletAddress)],
      });

      // Execute the transaction
      const result = await executeTransaction(tx);
      setTxResult(result);
      
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      console.error('Transaction error:', err);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-yellow-500/20 shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6">🚀 Transaction Examples</h2>
      
      <div className="space-y-4 mb-6">
        <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-4">
          <h3 className="text-yellow-400 font-semibold mb-2">Wallet Status</h3>
          <p className="text-white/80 text-sm">
            Address: {walletAddress ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-6)}` : 'Not connected'}
          </p>
          <p className="text-white/80 text-sm">
            ZK Proof: {zkProof ? '✅ Generated' : '❌ Not generated'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleSimpleTransaction}
          disabled={isLoading || !walletAddress}
          className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 ${
            isLoading || !walletAddress ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 inline-block" />
              Processing...
            </>
          ) : (
            'Simple Transfer'
          )}
        </button>

        <button
          onClick={handleCustomTransaction}
          disabled={isLoading || !walletAddress}
          className={`bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 ${
            isLoading || !walletAddress ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2 inline-block" />
              Processing...
            </>
          ) : (
            'Custom Transaction'
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-4">
          <h4 className="font-semibold mb-1">Error:</h4>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {txResult && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl">
          <h4 className="font-semibold mb-2">✅ Transaction Successful!</h4>
          <div className="space-y-2 text-sm">
            <p><span className="text-white/60">Digest:</span> {txResult.digest}</p>
            <p><span className="text-white/60">Status:</span> {txResult.effects?.status?.status}</p>
            {txResult.effects?.gasUsed && (
              <p><span className="text-white/60">Gas Used:</span> {txResult.effects.gasUsed.computationCost}</p>
            )}
          </div>
          <button
            onClick={() => window.open(`https://devnet.suivision.xyz/txblock/${txResult.digest}`, '_blank')}
            className="mt-3 text-yellow-400 hover:text-yellow-300 text-sm underline"
          >
            View on Explorer →
          </button>
        </div>
      )}

      <div className="mt-6 pt-6 border-t border-yellow-400/10">
        <h3 className="text-white font-semibold mb-3">💡 How it works:</h3>
        <div className="space-y-2 text-sm text-white/70">
          <p>1. Generate ZK proof for authentication</p>
          <p>2. Create and sign transaction with ephemeral key</p>
          <p>3. Submit with zkLogin signature to Sui network</p>
          <p>4. Transaction is verified and executed on-chain</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionExample;