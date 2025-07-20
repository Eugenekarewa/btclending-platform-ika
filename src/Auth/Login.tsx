import React, { useState, useEffect } from 'react';
import { useZkLogin } from '../hooks/useZkLogin';

import '../index.css';
interface LoginProps {
  onSwitchToSignup?: () => void;
  onBackToHome?: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignup, onBackToHome }) => {
  const { 
    walletAddress, 
    loginWithGoogle, 
    generateZkProof,
    logout,
    jwt,
    zkProof,
    isLoading 
  } = useZkLogin();
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWalletInfo, setShowWalletInfo] = useState(false);
  const [proofGenerated, setProofGenerated] = useState(false);

  useEffect(() => {
    if (walletAddress && jwt) {
      setShowSuccess(true);
      setShowWalletInfo(true);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 5000);
    }
  }, [walletAddress, jwt]);

  useEffect(() => {
    if (zkProof) {
      setProofGenerated(true);
    }
  }, [zkProof]);

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleGenerateProof = async () => {
    try {
      await generateZkProof();
    } catch (error) {
      console.error('ZK proof generation failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setShowSuccess(false);
    setShowWalletInfo(false);
    setProofGenerated(false);
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-yellow-900 text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-yellow-500/10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button
              onClick={onBackToHome}
              className="flex items-center text-2xl font-bold text-white hover:scale-105 transition-transform"
            >
              <span className="text-yellow-400 mr-2">₿</span>
              BTCLend
            </button>
            
            {walletAddress && (
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <div className="pt-20 flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md">
          {/* Success Message */}
          {showSuccess && (
            <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl mb-6 text-center animate-fade-in">
              ✅ Successfully logged in with zkLogin!
            </div>
          )}

          <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-yellow-500/20 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Welcome Back
              </h1>
              <p className="text-white/60">
                Sign in to access your secure wallet
              </p>
            </div>

            {!walletAddress ? (
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className={`w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/40 flex items-center justify-center text-lg mb-6 ${
                  isLoading ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-3" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm mr-3">
                      G
                    </div>
                    Sign in with Google
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-4">
                {/* Wallet Info */}
                <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-5 mb-6 animate-fade-in">
                  <p className="text-white/80 mb-2 font-medium">
                    <strong>Your Wallet Address:</strong>
                  </p>
                  <div className="font-mono text-sm text-yellow-400 bg-black/30 p-3 rounded-lg break-all">
                    {walletAddress}
                  </div>
                  <div className="text-white/60 text-xs mt-2">
                    Short: {truncateAddress(walletAddress)}
                  </div>
                </div>

                {/* ZK Proof Section */}
                {!proofGenerated ? (
                  <button
                    onClick={handleGenerateProof}
                    disabled={isLoading}
                    className={`w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 ${
                      isLoading ? 'opacity-60 cursor-not-allowed' : ''
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
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-center">
                    ✅ ZK Proof Generated Successfully!
                  </div>
                )}
              </div>
            )}

            {/* Features */}
            <div className="space-y-4 mb-8 pt-6 border-t border-yellow-400/10">
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-xs mr-4 flex-shrink-0">
                  🔐
                </div>
                <span className="text-white/80">Secure zkLogin authentication with Google</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-xs mr-4 flex-shrink-0">
                  ⚡
                </div>
                <span className="text-white/80">Lightning-fast access to your portfolio</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-xs mr-4 flex-shrink-0">
                  🛡️
                </div>
                <span className="text-white/80">Multi-signature security on Sui blockchain</span>
              </div>
            </div>

            {/* Toggle to Signup */}
            {!walletAddress && (
              <div className="text-center pt-6 border-t border-yellow-400/10">
                <p className="text-white/60 mb-4">Don't have an account?</p>
                <button
                  onClick={onSwitchToSignup}
                  className="text-yellow-400 hover:text-yellow-300 font-semibold px-4 py-2 rounded-lg border border-yellow-400/20 hover:border-yellow-400/40 hover:bg-yellow-400/10 transition-all"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;