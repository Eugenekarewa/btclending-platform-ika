import { useZkLogin } from '../hooks/useZkLogin';
import { useBTCKey } from '../hooks/useBTCKey';
import BTCBalance from './BTCBalance';

export default function WalletHeader() {
  const { walletAddress, loginWithGoogle } = useZkLogin();
  const { btcAddress } = useBTCKey();

  return (
    <div className="bg-blue-900 text-white p-4 rounded-2xl shadow-xl space-y-2">
      <h2 className="text-lg font-bold">Wallet Info</h2>

      {!walletAddress ? (
        <button
          onClick={loginWithGoogle}
          className="bg-sky-500 px-4 py-2 rounded-xl hover:bg-sky-600"
        >
          Login with Google
        </button>
      ) : (
        <>
          <p><strong>Sui Wallet:</strong> {walletAddress}</p>
          <p><strong>BTC Address:</strong> {btcAddress}</p>
          {btcAddress && <BTCBalance address={btcAddress} />}
        </>
      )}
    </div>
  );
}
