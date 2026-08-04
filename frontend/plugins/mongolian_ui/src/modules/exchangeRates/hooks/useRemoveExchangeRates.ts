import { useMutation } from '@apollo/client';
import { useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { EXCHANGE_RATES_QUERY_NAME } from '../constants';
import { mutations } from '../graphql';
import { notifyError, notifySuccess } from '../utils';

export const useRemoveExchangeRates = () => {
  const { confirm } = useConfirm();
  const { t } = useTranslation('mongolian');

  const [removeExchangeRates, { loading }] = useMutation(
    mutations.exchangeRatesRemove,
    {
      refetchQueries: [EXCHANGE_RATES_QUERY_NAME],
    },
  );

  const remove = (rateIds: string[], onSuccess?: () => void) => {
    const many = rateIds.length > 1;

    confirm({
      message: many
        ? t('delete-exchange-rates')
        : t('delete-exchange-rate'),
      options: { okLabel: t('delete'), cancelLabel: t('cancel') },
    }).then(async () => {
      try {
        await removeExchangeRates({ variables: { rateIds } });
        notifySuccess(many ? t('exchange-rates-deleted') : t('exchange-rate-deleted'));
        onSuccess?.();
      } catch (e) {
        notifyError(e);
      }
    });
  };

  return { remove, loading };
};
