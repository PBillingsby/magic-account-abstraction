"use client";
import { useAlchemyProvider } from "../hooks/useAlchemyProvider"
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { Address } from "@alchemy/aa-core";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useMagic } from "../magic/MagicProvider";
import { saveToken } from '@/utils/common';

type WalletContextProps = {
  // Functions
  login: (email: string) => Promise<void>;
  disconnectProviderFromAccount: () => void;

  // Properties
  provider: AlchemyProvider;
  scaAddress?: Address;
};

const defaultUnset: any = null;
const WalletContext = createContext<WalletContextProps>({
  // Default Values
  provider: defaultUnset,
  login: () => Promise.resolve(),
  disconnectProviderFromAccount: defaultUnset,
});

export const useWalletContext = () => useContext(WalletContext);

export const WalletContextProvider = ({
  children,
  setToken
}: {
  children: ReactNode;
  token: string;
  setToken: () => void;
}) => {
  const [scaAddress, setScaAddress] = useState<Address>();
  const entryPointAddress = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";

  const { magic, magicSigner } = useMagic();
  const { provider, connectProviderToAccount, disconnectProviderFromAccount } =
    useAlchemyProvider({ entryPointAddress });

  const login = useCallback(
    async (email: string) => {
      const didToken: string | null | undefined = await magic?.auth.loginWithEmailOTP({
        email,
      });

      if (didToken) {
        saveToken(didToken, setToken, 'EMAIL');
      }


      const metadata = await magic?.user.getMetadata();
      if (!didToken || !metadata?.publicAddress || !metadata.email) {
        throw new Error("Magic login failed");
      }

      connectProviderToAccount(magicSigner);
      // setUsername(metadata.email);
      // setOwnerAddress(metadata.publicAddress as Address);
      setScaAddress(await provider.getAddress());
    },
    [magic, connectProviderToAccount, magicSigner, provider]
  );

  useEffect(() => {
    async function fetchData() {
      const metadata = await magic?.user?.getMetadata();
      if (!metadata?.publicAddress || !metadata?.email) {
        throw new Error("Magic login failed");
      }

      connectProviderToAccount(magicSigner);
      // setUsername(metadata.email);
      // setOwnerAddress(metadata.publicAddress as Address);
      setScaAddress(await provider.getAddress());
    }
    fetchData();
  }, [magic, connectProviderToAccount, magicSigner, provider]);

  return (
    <WalletContext.Provider
      value={{
        login,
        provider,
        scaAddress,
        disconnectProviderFromAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
