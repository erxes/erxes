import { useLazyQuery, useQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
  configsList,
  tdbAccounts,
} from '~/modules/corporateGateway/tdb/configs/graphql/queries';
import { IPaymentDocument } from '~/modules/payment/types/Payment';

type TdbConfig = { _id: string; name: string };

type TdbAccount = {
  ACNTNO: string;
  IBAN?: string;
  iban?: string;
  ACNTNAME?: string;
  CURCODE?: string;
};

type Option = { value: string; label: string };

export const useTdbCGWForm = (
  form: UseFormReturn<FieldValues>,
  payment?: IPaymentDocument,
) => {
  const { t } = useTranslation('payment');
  const { setValue, watch } = form;

  const configId: string | undefined = watch('configId');

  const { loading, data } = useQuery(configsList, {
    variables: { limit: 100 },
  });

  const [loadAccounts, { loading: accountsLoading, data: accountsData }] =
    useLazyQuery(tdbAccounts);

  useEffect(() => {
    if (!payment?.config) return;

    Object.entries(payment.config).forEach(([key, value]) => {
      if (value !== undefined) {
        setValue(key, value);
      }
    });
  }, [payment, setValue]);

  useEffect(() => {
    if (!configId) return;

    loadAccounts({ variables: { configId } });
  }, [configId, loadAccounts]);

  const configOptions: Option[] = useMemo(
    () =>
      ((data?.tdbConfigsList?.list ?? []) as TdbConfig[]).map((config) => ({
        value: config._id,
        label: config.name,
      })),
    [data],
  );

  const accounts: TdbAccount[] = useMemo(
    () =>
      ((accountsData?.tdbAccounts?.data ?? []) as TdbAccount[]).filter(
        (account) => account.CURCODE === 'MNT' && !!account.IBAN,
      ),
    [accountsData],
  );

  const accountOptions: Option[] = useMemo(
    () =>
      accounts.map((account) => ({
        value: account.ACNTNO,
        label: `${account.ACNTNO} - ${account.ACNTNAME ?? ''}`,
      })),
    [accounts],
  );

  const isAccountDisabled = !configId || accountsLoading;

  const accountPlaceholder = accountsLoading
    ? t('loading')
    : t('select-account');

  const handleConfigChange = (
    value: string,
    onChange: (value: string) => void,
  ) => {
    onChange(value);
    setValue('accountNumber', '');
    setValue('iban', '');
    setValue('accountName', '');
  };

  const handleAccountChange = (
    value: string,
    onChange: (value: string) => void,
  ) => {
    onChange(value);

    const account = accounts.find((item) => item.ACNTNO === value);

    setValue('iban', account?.IBAN || account?.iban || '');
    setValue('accountName', account?.ACNTNAME || '');
  };

  return {
    t,
    loading,
    configOptions,
    accountOptions,
    isAccountDisabled,
    accountPlaceholder,
    handleConfigChange,
    handleAccountChange,
  };
};
