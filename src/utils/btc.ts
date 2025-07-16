export async function fetchBTCBalance(address: string) {
  const res = await fetch(`https://mempool.space/api/address/${address}`);
  if (!res.ok) throw new Error('Failed to fetch BTC balance');
  const data = await res.json();

  return {
    confirmed: data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum,
    unconfirmed: data.mempool_stats.funded_txo_sum - data.mempool_stats.spent_txo_sum
  };
}
