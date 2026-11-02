import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AUTH_TWO_FACTOR_DISABLE,
  AUTH_TWO_FACTOR_ENABLE,
  AUTH_TWO_FACTOR_RECOVERY_CODES,
  AUTH_TWO_FACTOR_SETUP,
  AUTH_TWO_FACTOR_STATUS,
} from '@/auth/two-factor/graphql';
import { ITwoFactorSetup, ITwoFactorStatus } from '@/auth/two-factor/types';

// What the page is asking the member for right now
export type TTwoFactorAccountStep =
  | { kind: 'idle' }
  | { kind: 'setup'; qr: ITwoFactorSetup }
  | { kind: 'regenerate' }
  | { kind: 'disable' }
  | { kind: 'codes'; codes: string[] };

const refetchStatus = { refetchQueries: [AUTH_TWO_FACTOR_STATUS] };

export const useTwoFactorAccount = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'two-factor' });
  const [step, setStep] = useState<TTwoFactorAccountStep>({ kind: 'idle' });

  const { data, loading, error } = useQuery<{
    authTwoFactorStatus: ITwoFactorStatus;
  }>(AUTH_TWO_FACTOR_STATUS, { fetchPolicy: 'network-only' });

  const [setup, { loading: settingUp }] = useMutation<{
    authTwoFactorSetup: ITwoFactorSetup;
  }>(AUTH_TWO_FACTOR_SETUP);
  const [enable, { loading: enabling }] = useMutation<{
    authTwoFactorEnable: string[];
  }>(AUTH_TWO_FACTOR_ENABLE, refetchStatus);
  const [disable, { loading: disabling }] = useMutation(
    AUTH_TWO_FACTOR_DISABLE,
    refetchStatus,
  );
  const [regenerate, { loading: regenerating }] = useMutation<{
    authTwoFactorRecoveryCodes: string[];
  }>(AUTH_TWO_FACTOR_RECOVERY_CODES, refetchStatus);

  const showError = (e: Error) =>
    toast({ title: e.message, variant: 'destructive' });

  const startSetup = () =>
    setup({
      onCompleted: (result) =>
        setStep({ kind: 'setup', qr: result.authTwoFactorSetup }),
      onError: showError,
    });

  const submitCode = (code: string) => {
    if (step.kind === 'setup') {
      return enable({
        variables: { code },
        onCompleted: (result) =>
          setStep({ kind: 'codes', codes: result.authTwoFactorEnable }),
        onError: showError,
      });
    }

    if (step.kind === 'regenerate') {
      return regenerate({
        variables: { code },
        onCompleted: (result) =>
          setStep({ kind: 'codes', codes: result.authTwoFactorRecoveryCodes }),
        onError: showError,
      });
    }

    return disable({
      variables: { code },
      onCompleted: () => {
        setStep({ kind: 'idle' });
        toast({ title: t('turned-off'), variant: 'success' });
      },
      onError: showError,
    });
  };

  return {
    status: data?.authTwoFactorStatus ?? null,
    loading,
    error,
    step,
    setStep,
    startSetup,
    submitCode,
    busy: settingUp || enabling || disabling || regenerating,
  };
};
