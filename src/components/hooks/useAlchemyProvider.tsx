import { getDefaultLightAccountFactoryAddress, LightSmartContractAccount } from "@alchemy/aa-accounts";
import { SmartAccountSigner } from "@alchemy/aa-core";
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import { polygonMumbai } from "viem/chains";
import { Address } from "viem";
import { useCallback, useState } from "react";

type AlchemyProviderProps = {
  entryPointAddress: Address;
};

export const useAlchemyProvider = ({
  entryPointAddress,
}: AlchemyProviderProps) => {
  const chain = polygonMumbai;
  const lightAccountFactoryAddress =
    getDefaultLightAccountFactoryAddress(chain);
  const [provider, setProvider] = useState<AlchemyProvider>(
    new AlchemyProvider({
      chain,
      entryPointAddress,
      rpcUrl: process.env.NEXT_PUBLIC_MUMBAI_RPC!,
    })
  );

  const connectProviderToAccount = useCallback(
    (signer: SmartAccountSigner, account?: Address) => {
      const connectedProvider = provider
        .connect((provider) => {
          return new LightSmartContractAccount({
            rpcClient: provider,
            owner: signer,
            chain,
            entryPointAddress,
            factoryAddress: lightAccountFactoryAddress,
            accountAddress: account,
          });
        })

      setProvider(connectedProvider);
      return connectedProvider;
    },
    [entryPointAddress, provider]
  );

  const disconnectProviderFromAccount = useCallback(() => {
    const disconnectedProvider = provider.disconnect();

    setProvider(disconnectedProvider);
    return disconnectedProvider;
  }, [provider]);

  return { provider, connectProviderToAccount, disconnectProviderFromAccount };
};
