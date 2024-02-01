import { useCallback, useEffect, useMemo, useState } from 'react';
import Divider from '@/components/ui/Divider';
import { LoginProps } from '@/utils/types';
import { logout } from '@/utils/common';
import { useMagic } from '../MagicProvider';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import CardLabel from '@/components/ui/CardLabel';
import Spinner from '@/components/ui/Spinner';
import { getNetworkName, getNetworkToken } from '@/utils/network';
import { useWalletContext } from '@/components/alchemy/AlchemyProviderWrapper';

const UserInfo = ({ token, setToken }: LoginProps) => {
  const { provider, disconnectProviderFromAccount } = useWalletContext();

  const { magic, web3 } = useMagic();

  const [magicBalance, setMagicBalance] = useState('...');
  const [aaBalance, setAABalance] = useState('...');

  const [copied, setCopied] = useState('Copy');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [publicAddress, setPublicAddress] = useState(localStorage.getItem('user'));
  const [accountAddress, setAccountAddress] = useState("");

  useEffect(() => {
    const checkLoginandGetBalance = async () => {
      const isLoggedIn = await magic?.user.isLoggedIn();
      const aaAccount = await provider.account?.getAddress();
      console.log(aaAccount)
      setAccountAddress(aaAccount)
      if (isLoggedIn) {
        try {
          const metadata = await magic?.user.getInfo();
          if (metadata) {
            localStorage.setItem('user', metadata?.publicAddress!);
            setPublicAddress(metadata?.publicAddress!);
          }
        } catch (e) {
          console.log('error in fetching address: ' + e);
        }
      }
    };
    setTimeout(() => checkLoginandGetBalance(), 5000);
  }, []);

  const getBalance = useCallback(async () => {
    if (publicAddress && web3) {
      const magicBalance = await web3.eth.getBalance(publicAddress);
      if (magicBalance == BigInt(0)) {
        setMagicBalance('0');
      } else {
        setMagicBalance(web3.utils.fromWei(magicBalance, 'ether'));
      }
      console.log('BALANCE: ', magicBalance);
    }
    if (accountAddress && web3) {
      const aaBalance = await web3.eth.getBalance(accountAddress);
      if (aaBalance == BigInt(0)) {
        setAABalance('0');
      } else {
        setAABalance(web3.utils.fromWei(aaBalance, 'ether'));
      }
    }
  }, [web3, publicAddress, accountAddress]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await getBalance();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, [getBalance]);

  useEffect(() => {
    if (web3) {
      refresh();
    }
  }, [web3, refresh]);

  useEffect(() => {
    setMagicBalance('...');
  }, [magic]);

  const disconnect = useCallback(async () => {
    if (magic) {
      await logout(setToken, magic);
      disconnectProviderFromAccount();
    }
  }, [magic, setToken]);

  const copy = useCallback(() => {
    if (publicAddress && copied === 'Copy') {
      setCopied('Copied!');
      navigator.clipboard.writeText(publicAddress);
      setTimeout(() => {
        setCopied('Copy');
      }, 1000);
    }
  }, [copied, publicAddress]);

  return (
    <Card>
      <CardHeader id="Wallet">Wallet</CardHeader>
      <CardLabel leftHeader="Status" rightAction={<div onClick={disconnect}>Disconnect</div>} isDisconnect />
      <div className="flex-row">
        <div className="green-dot" />
        <div className="connected">Connected to {getNetworkName()}</div>
      </div>
      <Divider />
      <CardLabel leftHeader="Address" rightAction={!publicAddress ? <Spinner /> : <div onClick={copy}>{copied}</div>} />
      <div className="flex flex-col gap-2">
        <div className="code">Magic: {publicAddress?.length == 0 ? 'Fetching address..' : publicAddress}</div>
        <div className="code">AA: {accountAddress?.length == 0 ? 'Fetching address..' : accountAddress}</div>
      </div>
      <Divider />
      <CardLabel
        leftHeader="Balance"
        rightAction={
          isRefreshing ? (
            <div className="loading-container">
              <Spinner />
            </div>
          ) : (
            <div onClick={refresh}>Refresh</div>
          )
        }
      />
      <div className="flex flex-col gap-2">
        <div className="code">
          Magic: {magicBalance.substring(0, 7)} {getNetworkToken()}
        </div>
        <div className="code">
          AA: {aaBalance.substring(0, 7)} {getNetworkToken()}
        </div>
      </div>
    </Card>
  );
};

export default UserInfo;
