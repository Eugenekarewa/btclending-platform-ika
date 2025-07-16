import { useEffect, useState } from 'react';
import { hexToBytes, bytesToHex } from '@noble/hashes/utils';
import { sha256 } from '@noble/hashes/sha256';
import { ripemd160 } from '@noble/hashes/ripemd160';
import * as secp256k1 from '@noble/secp256k1';
import { bech32 } from 'bech32';

const LOCAL_KEY_NAME = 'dwallet_keypair';

// Helper function to generate a P2WPKH address from a public key
function getAddressFromPublicKey(publicKey: Uint8Array): string {
  // 1. SHA256 of the public key
  const sha256Hash = sha256(publicKey);
  // 2. RIPEMD160 of the SHA256 hash
  const ripemd160Hash = ripemd160(sha256Hash);
  // 3. Convert to Bech32 address (P2WPKH)
  const words = bech32.toWords(ripemd160Hash);
  // 'bc' is the human-readable part for Bitcoin mainnet
  return bech32.encode('bc', words);
}

// Helper function to generate a keypair from entropy
function generateKeypairFromEntropy(entropy: Uint8Array) {
  // Use entropy as private key seed
  const privateKey = entropy;
  // Get the public key in compressed format
  const publicKey = secp256k1.getPublicKey(privateKey, true);
  return { secretKey: privateKey, publicKey };
}

export function useBTCKey() {
  const [btcAddress, setBTCAddress] = useState<string | null>(null);
  const [pubkeyHex, setPubkeyHex] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_KEY_NAME);
    if (stored) {
      const keypair = JSON.parse(stored);
      const pubkey = hexToBytes(keypair.publicKeyHex);
      const addr = getAddressFromPublicKey(pubkey);
      setBTCAddress(addr);
      setPubkeyHex(keypair.publicKeyHex);
    } else {
      const entropy = crypto.getRandomValues(new Uint8Array(32));
      const keypair = generateKeypairFromEntropy(entropy);
      const publicKeyHex = bytesToHex(keypair.publicKey);
      const privateKeyHex = bytesToHex(keypair.secretKey);
      localStorage.setItem(
        LOCAL_KEY_NAME,
        JSON.stringify({ publicKeyHex, privateKeyHex })
      );
      const addr = getAddressFromPublicKey(keypair.publicKey);
      setBTCAddress(addr);
      setPubkeyHex(publicKeyHex);
    }
  }, []);

  return { btcAddress, pubkeyHex };
}
