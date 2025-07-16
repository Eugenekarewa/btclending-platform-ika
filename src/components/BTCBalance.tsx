import { useEffect, useState } from 'react';
import { fetchBTCBalance } from '../utils/btc';

export default function BTCBalance({ address }: { address: string }) {
  const [balance, setBalance] = useState<{ confirmed: number; unconfirmed: number } | null>(null);

  useEffect(() => {
    if (address) {
      fetchBTCBalance(address)
        .then(setBalance)
        .catch(console.error);
    }
  }, [address]);

  if (!balance) return <p>Loading BTC balance...</p>;

  return (
    <div className="text-sm">
      <p><strong>Confirmed:</strong> {balance.confirmed / 1e8} BTC</p>
      <p><strong>Unconfirmed:</strong> {balance.unconfirmed / 1e8} BTC</p>
    </div>
  );
}
