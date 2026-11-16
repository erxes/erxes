import { useMutation } from '@apollo/client';
import { toast, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CURRENCY_RATES_QUERY_NAME } from '../constants';
import {
  CURRENCY_RATE_ADD,
  CURRENCY_RATE_EDIT,
  CURRENCY_RATES_REMOVE,
} from '../graphql';
import { TCurrencyRateForm } from '../types';

const notifyError = (error: unknown) =>
  toast({
    title: 'Error',
    description:
      error instanceof Error ? error.message : 'Something went wrong',
    variant: 'destructive',
  });

const refetchQueries = [CURRENCY_RATES_QUERY_NAME];

export const useCurrencyRateSave = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'currency-rates' });
  const [add, { loading: adding }] = useMutation(CURRENCY_RATE_ADD, {
    refetchQueries,
  });
  const [edit, { loading: editing }] = useMutation(CURRENCY_RATE_EDIT, {
    refetchQueries,
  });

  const save = async (
    values: TCurrencyRateForm,
    _id?: string,
  ): Promise<boolean> => {
    try {
      if (_id) {
        await edit({ variables: { _id, ...values } });
      } else {
        await add({ variables: values });
      }

      toast({
        variant: 'success',
        title: _id
          ? t('rate-updated', 'Exchange rate updated')
          : t('rate-added', 'Exchange rate added'),
      });

      return true;
    } catch (e) {
      notifyError(e);
      return false;
    }
  };

  return { save, loading: adding || editing };
};

export const useCurrencyRatesRemove = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'currency-rates' });
  const { confirm } = useConfirm();
  const [removeRates, { loading }] = useMutation(CURRENCY_RATES_REMOVE, {
    refetchQueries,
  });

  const remove = (_ids: string[], onSuccess?: () => void) =>
    confirm({
      message: t('confirm-delete', {
        count: _ids.length,
        defaultValue: 'Delete {{count}} exchange rate(s)? This cannot be undone.',
      }),
      options: { okLabel: t('delete', 'Delete') },
    }).then(async () => {
      try {
        await removeRates({ variables: { _ids } });
        toast({
          variant: 'success',
          title: t('rates-deleted', 'Exchange rates deleted'),
        });
        onSuccess?.();
      } catch (e) {
        notifyError(e);
      }
    });

  return { remove, loading };
};
