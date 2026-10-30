import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  LOGIN_TWO_FACTOR_SETUP,
  LOGIN_TWO_FACTOR_VERIFY,
} from '@/auth/two-factor/graphql';
import { ITwoFactorChallenge, ITwoFactorSetup } from '@/auth/two-factor/types';

/** The sign-in step after the password: set up if asked, then one code. */
export const useTwoFactorLoginStep = ({
  challenge,
  setup,
  onSignedIn,
  onExpired,
}: ITwoFactorChallenge & {
  onSignedIn: () => void;
  onExpired: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'auth' });
  const [qr, setQr] = useState<ITwoFactorSetup | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const [startSetup, { loading: settingUp }] = useMutation<{
    loginTwoFactorSetup: ITwoFactorSetup;
  }>(LOGIN_TWO_FACTOR_SETUP);
  const [verify, { loading: verifying }] = useMutation<{
    loginTwoFactorVerify: string[] | null;
  }>(LOGIN_TWO_FACTOR_VERIFY);

  const failed = (reason: unknown) => {
    toast({
      title: t(
        `login-failure.${typeof reason === 'string' ? reason : 'two_factor_invalid'}`,
      ),
      variant: 'destructive',
    });

    if (reason === 'two_factor_expired' || reason === 'rate_limited') {
      onExpired();
    }
  };

  // Setup starts once per challenge; a second call would replace the secret
  const setupStarted = useRef(false);

  useEffect(() => {
    if (!setup || setupStarted.current) return;

    setupStarted.current = true;
    startSetup({
      variables: { challenge },
      onCompleted: (data) => setQr(data.loginTwoFactorSetup),
      onError: (e) => failed(e.graphQLErrors[0]?.extensions?.reason),
    });
  }, [challenge, setup, startSetup, failed]);

  const submitCode = (code: string) =>
    verify({
      variables: { challenge, code },
      onCompleted: (data) => {
        const codes = data.loginTwoFactorVerify || [];

        // A finished setup shows its recovery codes before going in
        if (codes.length) {
          setRecoveryCodes(codes);
          return;
        }

        onSignedIn();
      },
      onError: (e) => failed(e.graphQLErrors[0]?.extensions?.reason),
    });

  return {
    qr,
    settingUp,
    verifying,
    recoveryCodes,
    submitCode,
  };
};
