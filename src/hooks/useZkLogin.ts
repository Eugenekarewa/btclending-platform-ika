
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import {
  generateNonce,
  generateRandomness,
  jwtToAddress,
} from '@mysten/sui/zklogin';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const suiClient = new SuiClient({ url: getFullnodeUrl('testnet') });

export function useZkLogin() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [ephemeralKeyPair, setEphemeralKeyPair] = useState<Ed25519Keypair | null>(null);
  const [nonce, setNonce] = useState<string | null>(null);
  const [maxEpoch, setMaxEpoch] = useState<number>(0);

  // Extract JWT from URL after redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get('id_token');
    if (token) {
      const decoded = jwtDecode(token) as { sub: string; aud: string | string[] };
      setJwt(token);

      const salt = localStorage.getItem('user_salt') || '123456789012345678901234567890123456';
      localStorage.setItem('user_salt', salt);

      const address = jwtToAddress(token, salt);
      setWalletAddress(address);
    }
  }, []);

  async function loginWithGoogle() {
    const { epoch } = await suiClient.getLatestSuiSystemState();
    const max = Number(epoch) + 2;
    setMaxEpoch(max);

    const ephemeral = new Ed25519Keypair();
    const randomness = generateRandomness();
    const nonceVal = generateNonce(ephemeral.getPublicKey(), max, randomness);

    setEphemeralKeyPair(ephemeral);
    setNonce(nonceVal);

    const CLIENT_ID = '333368837099-79d6vv7coil9b0qal998cd7jcv1qukh3.apps.googleusercontent.com';
    const REDIRECT_URI = window.location.origin;

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&response_type=id_token&redirect_uri=${REDIRECT_URI}&scope=openid&nonce=${nonceVal}`;
    window.location.href = authUrl;
  }

  return {
    walletAddress,
    loginWithGoogle,
    jwt,
    ephemeralKeyPair,
    maxEpoch,
    nonce
  };
}
