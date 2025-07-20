
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { fromB64, toB64 } from "@mysten/sui/bcs";
import { SuiClient } from "@mysten/sui/client";
import { SerializedSignature } from "@mysten/sui/cryptography";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { Transaction } from "@mysten/sui/transactions";
import { MIST_PER_SUI } from "@mysten/sui/utils";
import {
  genAddressSeed,
  generateNonce,
  generateRandomness,
  getExtendedEphemeralPublicKey,
  getZkLoginSignature,
  jwtToAddress,
} from "@mysten/sui/zklogin";

const node_url = 'https://fullnode.devnet.sui.io';
const suiClient = new SuiClient({ url: node_url });

export interface JwtPayload {
  iss?: string;
  sub?: string; // Subject ID
  aud?: string[] | string;
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
}

export type PartialZkLoginSignature = Omit<
  Parameters<typeof getZkLoginSignature>["0"]["inputs"],
  "addressSeed"
>;

export function useZkLogin() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [ephemeralKeyPair, setEphemeralKeyPair] = useState<Ed25519Keypair | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [maxEpoch, setMaxEpoch] = useState<number>(0);
  const [randomness, setRandomness] = useState<string | null>(null);
  const [userSalt, setUserSalt] = useState<string | null>(null);
  const [zkProof, setZkProof] = useState<PartialZkLoginSignature | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load persisted data from storage
  useEffect(() => {
    const storedEphemeralKey = sessionStorage.getItem('ephemeral_key');
    const storedRandomness = sessionStorage.getItem('randomness');
    const storedSalt = localStorage.getItem('user_salt');
    const storedMaxEpoch = localStorage.getItem('max_epoch');

    if (storedEphemeralKey) {
      try {
        // The stored key is a base64 string from export().privateKey
        const keyPair = Ed25519Keypair.fromSecretKey(storedEphemeralKey);
        setEphemeralKeyPair(keyPair);
      } catch (error) {
        console.error('Failed to restore ephemeral keypair:', error);
        // Clear invalid stored key
        sessionStorage.removeItem('ephemeral_key');
      }
    }
    if (storedRandomness) {
      setRandomness(storedRandomness);
    }
    if (storedSalt) {
      setUserSalt(storedSalt);
    }
    if (storedMaxEpoch) {
      setMaxEpoch(Number(storedMaxEpoch));
    }
  }, []);

  // Extract JWT from URL after redirect and fetch wallet address from backend
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const token = params.get('id_token');
    


    if (token) {
      try {
        const decodedJwt = jwtDecode(token) as JwtPayload;
        setJwt(token);

        // Always derive wallet address locally for zkLogin
        let salt = localStorage.getItem('user_salt');
        if (!salt) {
          salt = generateRandomness();
          localStorage.setItem('user_salt', salt);
        }
        setUserSalt(salt);
        const address = jwtToAddress(token, salt);
        setWalletAddress(address);

        // Clear the URL hash to prevent repeated processing
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch (error) {
        console.error('Failed to process JWT:', error);
      }
    }
  }, []);

  async function loginWithGoogle() {
    try {
      setIsLoading(true);
      
      // Get current epoch
      const { epoch } = await suiClient.getLatestSuiSystemState();
      const max = Number(epoch) + 10; // Give more buffer for epoch
      setMaxEpoch(max);
      localStorage.setItem('max_epoch', max.toString());

      // Generate ephemeral keypair
      const ephemeral = new Ed25519Keypair();
      // Export the private key as base64 for storage
      const privateKeyBytes = ephemeral.export().privateKey;
      sessionStorage.setItem('ephemeral_key', privateKeyBytes);
      setEphemeralKeyPair(ephemeral);

      // Generate randomness
      const randomnessVal = generateRandomness();
      sessionStorage.setItem('randomness', randomnessVal);
      setRandomness(randomnessVal);

      // Generate nonce
      const nonceVal = generateNonce(ephemeral.getPublicKey(), max, randomnessVal);
      setNonce(nonceVal);

      // Google OAuth configuration
      const CLIENT_ID = '333368837099-79d6vv7coil9b0qal998cd7jcv1qukh3.apps.googleusercontent.com';
      const REDIRECT_URI = window.location.origin + '/Login';

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=id_token&redirect_uri=${REDIRECT_URI}&scope=openid&nonce=${nonceVal}`;
      window.location.href = authUrl;
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
    }
  }

  async function generateZkProof() {
    if (!jwt || !ephemeralKeyPair || !maxEpoch || !randomness || !userSalt) {
      throw new Error('Missing required parameters for ZK proof generation');
    }

    try {
      setIsLoading(true);
      
      const extendedEphemeralPublicKey = getExtendedEphemeralPublicKey(
        ephemeralKeyPair.getPublicKey()
      );

      // Call the ZK proof service
      const response = await fetch('https://prover-dev.mystenlabs.com/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jwt: jwt,
          extendedEphemeralPublicKey: extendedEphemeralPublicKey,
          maxEpoch: maxEpoch,
          jwtRandomness: randomness,
          salt: userSalt,
          keyClaimName: 'sub',
        }),
      });

      if (!response.ok) {
        throw new Error(`ZK proof generation failed: ${response.statusText}`);
      }

      const zkProofResult = await response.json();
      setZkProof(zkProofResult);
      return zkProofResult;
    } catch (error) {
      console.error('ZK proof generation failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function executeTransaction(transaction: Transaction) {
    if (!ephemeralKeyPair || !zkProof || !jwt || !userSalt || !walletAddress) {
      throw new Error('Missing required parameters for transaction execution');
    }

    try {
      setIsLoading(true);
      
      // Set sender
      transaction.setSender(walletAddress);

      // Sign the transaction with ephemeral key pair
      const { bytes, signature: userSignature } = await transaction.sign({
        client: suiClient,
        signer: ephemeralKeyPair,
      });

      // Decode JWT to get required fields
      const decodedJwt = jwtDecode(jwt) as JwtPayload;
      if (!decodedJwt?.sub || !decodedJwt.aud) {
        throw new Error('Invalid JWT: missing sub or aud fields');
      }

      // Generate address seed
      const addressSeed = genAddressSeed(
        BigInt(userSalt),
        'sub',
        decodedJwt.sub,
        Array.isArray(decodedJwt.aud) ? decodedJwt.aud[0] : decodedJwt.aud
      ).toString();

      // Create ZK login signature
      const zkLoginSignature: SerializedSignature = getZkLoginSignature({
        inputs: {
          ...zkProof,
          addressSeed,
        },
        maxEpoch,
        userSignature,
      });

      // Execute transaction
      const result = await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature: zkLoginSignature,
      });

      return result;
    } catch (error) {
      console.error('Transaction execution failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function createAndSetWallet() {
    try {
      setIsLoading(true);
      // For now, we'll use the wallet address derived from JWT
      // This can be extended to create additional wallet functionality
      if (walletAddress) {
        return walletAddress;
      }
      throw new Error('No wallet address available');
    } catch (error) {
      console.error('Wallet creation failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    setWalletAddress(null);
    setJwt(null);
    setEphemeralKeyPair(null);
    setNonce(null);
    setMaxEpoch(0);
    setRandomness(null);
    setUserSalt(null);
    setZkProof(null);
    
    // Clear storage
    sessionStorage.removeItem('ephemeral_key');
    sessionStorage.removeItem('randomness');
    localStorage.removeItem('user_salt');
    localStorage.removeItem('max_epoch');
  }

  return {
    walletAddress,
    loginWithGoogle,
    generateZkProof,
    executeTransaction,
    createAndSetWallet,
    logout,
    jwt,
    ephemeralKeyPair,
    maxEpoch,
    nonce,
    randomness,
    userSalt,
    zkProof,
    isLoading,
  };
}
