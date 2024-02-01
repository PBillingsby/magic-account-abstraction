import { useMagic } from '../MagicProvider';
import showToast from '@/utils/showToast';
import Spinner from '../../ui/Spinner';
import { RPCError, RPCErrorCode } from 'magic-sdk';
import { LoginProps } from '@/utils/types';
import { saveToken } from '@/utils/common';
import Card from '../../ui/Card';
import CardHeader from '../../ui/CardHeader';
import { useEffect, useState } from 'react';
import FormInput from '@/components/ui/FormInput';
import { useWalletContext } from '@/components/alchemy/AlchemyProviderWrapper';

const EmailOTP = ({ token, setToken }: LoginProps) => {
  const [owner, setOwner] = useState<any>()
  const { magic } = useMagic();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [isLoginInProgress, setLoginInProgress] = useState(false);
  const { login } = useWalletContext();

  return (
    <Card>
      <CardHeader id="login">Email OTP Login</CardHeader>
      <div className="login-method-grid-item-container">
        <FormInput
          onChange={(e) => {
            if (emailError) setEmailError(false);
            setEmail(e.target.value);
          }}
          placeholder={token.length > 0 ? 'Already logged in' : 'Email'}
          value={email}
        />
        {emailError && <span className="error">Enter a valid email</span>}
        <button
          className="login-button"
          disabled={isLoginInProgress || (token.length > 0 ? false : email.length == 0)}
          onClick={() => login(email)}
        >
          {isLoginInProgress ? <Spinner /> : 'Log in / Sign up'}
        </button>
      </div>
    </Card>
  );
};

export default EmailOTP;
