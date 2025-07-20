import React, { useState, useEffect } from 'react';
import { useZkLogin } from '../hooks/useZkLogin';

interface SignupProps {
  onSwitchToLogin?: () => void;
  onBackToHome?: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSwitchToLogin, onBackToHome }) => {
  const { 
    walletAddress, 
    loginWithGoogle, 
    generateZkProof,
    createAndSetWallet,
    logout,
    jwt,
    zkProof,
    isLoading 
  } = useZkLogin();
  
  const [showSuccess, setShowSuccess] = useState(false);
  const [showWalletInfo, setShowWalletInfo] = useState(false);
  const [proofGenerated, setProofGenerated] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  useEffect(() => {
    if (walletAddress && jwt) {
      setShowSuccess(true);
      setShowWalletInfo(true);
      setAccountCreated(true);
      
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

  const handleGoogleSignup = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  const handleGenerateProof = async () => {
    try {
      await generateZkProof();
    } catch (error) {
      console.error('ZK proof generation failed:', error);
    }
  };

  const handleCreateWallet = async () => {
    try {
      await createAndSetWallet();
    } catch (error) {
      console.error('Wallet creation failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    setShowSuccess(false);
    setShowWalletInfo(false);
    setProofGenerated(false);
    setAccountCreated(false);
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
              🎉 Welcome to BTCLend! Your account has been created successfully!
            </div>
          )}

          <div className="bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-yellow-500/20 shadow-2xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                Create Account
              </h1>
              <p className="text-white/60">
                Join BTCLend with secure zkLogin authentication
              </p>
            </div>

            {!accountCreated ? (
              <div className="space-y-6">
                <button
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black font-semibold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-400/40 flex items-center justify-center text-lg ${
                    isLoading ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-3" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm mr-3">
                        G
                      </div>
                      Create Account with Google
                    </>
                  )}
                </button>

                {/* Account Creation Benefits */}
                <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-6">
                  <h3 className="text-yellow-400 font-semibold mb-3">What you'll get:</h3>
                  <div className="space-y-2 text-sm text-white/80">
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      Secure wallet powered by Sui blockchain
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      Zero-knowledge proof authentication
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      Access to Bitcoin lending protocols
                    </div>
                    <div className="flex items-center">
                      <span className="text-green-400 mr-2">✓</span>
                      Multi-signature security features
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Wallet Info */}
                <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-xl p-5 mb-6 animate-fade-in">
                  <p className="text-white/80 mb-2 font-medium">
                    <strong>Your New Wallet Address:</strong>
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
                      '🔐 Complete Setup - Generate ZK Proof'
                    )}
                  </button>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-center">
                    ✅ Account Setup Complete! You're ready to start lending.
                  </div>
                )}

                {/* Next Steps */}
                {proofGenerated && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 mt-4">
                    <h3 className="text-blue-400 font-semibold mb-3">Next Steps:</h3>
                    <div className="space-y-2 text-sm text-white/80">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-2">→</span>
                        Access your dashboard
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-2">→</span>
                        Connect your Bitcoin wallet
                      </div>
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-2">→</span>
                        Start exploring lending opportunities
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Security Features */}
            <div className="space-y-4 mb-8 pt-6 border-t border-yellow-400/10">
              <h3 className="text-white font-semibold mb-3">🛡️ Security Features</h3>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-xs mr-4 flex-shrink-0">
                  🔐
                </div>
                <span className="text-white/80">Zero-knowledge proof authentication</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-xs mr-4 flex-shrink-0">
                  ⚡
                </div>
                <span className="text-white/80">Sui blockchain integration</span>
              </div>
              <div className="flex items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-black font-bold text-xs mr-4 flex-shrink-0">
                  🛡️
                </div>
                <span className="text-white/80">Non-custodial wallet management</span>
              </div>
            </div>

            {/* Toggle to Login */}
            {!accountCreated && (
              <div className="text-center pt-6 border-t border-yellow-400/10">
                <p className="text-white/60 mb-4">Already have an account?</p>
                <button
                  onClick={onSwitchToLogin}
                  className="text-yellow-400 hover:text-yellow-300 font-semibold px-4 py-2 rounded-lg border border-yellow-400/20 hover:border-yellow-400/40 hover:bg-yellow-400/10 transition-all"
                >
                  Sign In
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

export default Signup;