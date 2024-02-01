import React, { useCallback, useEffect, useState } from 'react';
import Divider from '@/components/ui/Divider';
import { useMagic } from '../MagicProvider';
import FormButton from '@/components/ui/FormButton';
import FormInput from '@/components/ui/FormInput';
import ErrorText from '@/components/ui/ErrorText';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import { getFaucetUrl, getNetworkToken } from '@/utils/network';
import showToast from '@/utils/showToast';
import Spacer from '@/components/ui/Spacer';
import TransactionHistory from '@/components/ui/TransactionHistory';
import Image from 'next/image';
import Link from 'public/link.svg';
import { useWalletContext } from '@/components/alchemy/AlchemyProviderWrapper';
import { SendUserOperationResult } from '@alchemy/aa-core';
import { parseEther } from "viem";

const SendTransaction = () => {
  const { provider } = useWalletContext();

  const { web3 } = useMagic();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [disabled, setDisabled] = useState(!toAddress || !amount);
  const [hash, setHash] = useState('');
  const [toAddressError, setToAddressError] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const publicAddress = localStorage.getItem('user');
  const [aaAddress, setAaAddress] = useState<string>('');

  const getAddress = async () => {
    return await provider?.account?.getAddress();
  };


  useEffect(() => {
    const fetchAddress = async () => {
      const address = await getAddress();
      setAaAddress(address || '');
    };

    fetchAddress();
  }, []);

  useEffect(() => {
    setDisabled(!toAddress || !amount);
    setAmountError(false);
    setToAddressError(false);
  }, [amount, toAddress]);

  const sendTransaction = useCallback(async () => {
    if (!web3?.utils.isAddress(toAddress)) {
      return setToAddressError(true);
    }
    if (isNaN(Number(amount))) {
      return setAmountError(true);
    }
    setDisabled(true);
    // const txnParams = {
    //   // from: aaAddress,
    //   to: toAddress,
    //   value: web3.utils.toWei(amount, 'ether'),
    //   gas: 21000,
    // };

    // const signer = await createSigner();
    console.log("TO ADDRESS: ", toAddress)

    const amountToSend: bigint = parseEther(amount);

    try {
      const result: SendUserOperationResult = await provider.sendUserOperation({
        target: toAddress as `0x${string}`,
        data: "0x",
        value: amountToSend,
      });

      const txHash = await provider.waitForUserOperationTransaction(
        result.hash as `0x${string}`
      );

      console.log("\nTransaction hash: ", txHash);

      const userOpReceipt = await provider.getUserOperationReceipt(
        result.hash as `0x${string}`
      );

      console.log("\nUser operation receipt: ", userOpReceipt);

      const txReceipt = await provider.rpcClient.waitForTransactionReceipt({
        hash: txHash,
      });
    } catch (err) {
      console.log("-------", err)
    }
    debugger
    // setHash(txHash);

    debugger

    // await provider.sendTransaction(txnParams)

    // web3.eth
    //   .sendTransaction(txnParams as any)
    //   .on('transactionHash', (txHash) => {
    //     setHash(txHash);
    //     console.log('Transaction hash:', txHash);
    //   })
    //   .then((receipt) => {
    //     showToast({
    //       message: 'Transaction Successful',
    //       type: 'success',
    //     });
    //     setToAddress('');
    //     setAmount('');
    //     console.log('Transaction receipt:', receipt);
    //   })
    //   .catch((error) => {
    //     console.error("!", error);
    //     setDisabled(false);
    //   });
  }, [web3, amount, publicAddress, toAddress]);

  return (
    <Card>
      <CardHeader id="send-transaction">Send Transaction</CardHeader>
      {getFaucetUrl() && (
        <div>
          <a href={getFaucetUrl()} target="_blank" rel="noreferrer">
            <FormButton onClick={() => null} disabled={false}>
              Get Test {getNetworkToken()}
              <Image src={Link} alt="link-icon" className="ml-[3px]" />
            </FormButton>
          </a>
          <Divider />
        </div>
      )}

      <>
        <FormInput
          value={toAddress || ""}
          onChange={(e: any) => setToAddress(e.target.value)}
          placeholder="Receiving Address"
        />
      </>
      {toAddressError ? <ErrorText>Invalid address</ErrorText> : null}
      <FormInput
        value={amount}
        onChange={(e: any) => setAmount(e.target.value)}
        placeholder={`Amount (${getNetworkToken()})`}
      />
      {amountError ? <ErrorText className="error">Invalid amount</ErrorText> : null}
      <FormButton onClick={sendTransaction} disabled={!toAddress || !amount || disabled}>
        Send Transaction
      </FormButton>

      {hash ? (
        <>
          <Spacer size={20} />
          <TransactionHistory />
        </>
      ) : null}
    </Card>
  );
};

export default SendTransaction;
