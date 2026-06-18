import { useMutation } from '@apollo/client';
import { useConfirm } from 'erxes-ui';
import { EXCHANGE_RATES_QUERY_NAME } from '../constants';
import { mutations } from '../graphql';
import { notifyError, notifySuccess } from '../utils';

export const useRemoveExchangeRates = () => {
  const { confirm } = useConfirm();

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
        ? 'Are you sure you want to delete the selected exchange rates?'
        : 'Are you sure you want to delete this exchange rate?',
      options: { okLabel: 'Delete', cancelLabel: 'Cancel' },
    }).then(async () => {
      try {
        await removeExchangeRates({ variables: { rateIds } });
        notifySuccess(many ? 'Exchange rates deleted' : 'Exchange rate deleted');
        onSuccess?.();
      } catch (e) {
        notifyError(e);
      }
    });
  };

  return { remove, loading };
};
