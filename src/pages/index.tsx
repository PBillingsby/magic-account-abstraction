import MagicProvider from '../components/magic/MagicProvider';
import { WalletContextProvider } from "../components/alchemy/AlchemyProviderWrapper"
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from '@/components/magic/Login';
import Dashboard from '@/components/magic/Dashboard';
import MagicDashboardRedirect from '@/components/magic/MagicDashboardRedirect';

export default function Home() {
  const [token, setToken] = useState('');

  useEffect(() => {
    setToken(localStorage.getItem('token') ?? '');
  }, [setToken]);

  console.log(token)

  return (
    <MagicProvider>
      <WalletContextProvider token={token} setToken={setToken}>
        <ToastContainer />
        {process.env.NEXT_PUBLIC_MAGIC_API_KEY ? (
          token.length > 0 ? (
            <Dashboard token={token} setToken={setToken} />
          ) : (
            <Login token={token} setToken={setToken} />
          )
        ) : (
          <MagicDashboardRedirect />
        )}
      </WalletContextProvider>
    </MagicProvider>
  );
}
