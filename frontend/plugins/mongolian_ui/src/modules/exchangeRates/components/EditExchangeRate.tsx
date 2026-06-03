import { useMutation } from '@apollo/client';
import { Sheet, useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { mutations } from '../graphql';
import {
  EXCHANGE_RATE_ID_QUERY_KEY,
  EXCHANGE_RATES_QUERY_NAME,
  TExchangeRateForm,
} from '../constants';
import { exchangeRateDetailAtom } from '../states/exchangeRatesStates';
import { useExchangeRateForm } from '../hooks/useExchangeRateForm';
import { notifyError, notifySuccess } from '../utils';
import { ExchangeRateSheetContent } from './ExchangeRateSheetContent';

const FORM_ID = 'edit-exchange-rate-form';

export const EditExchangeRate = () => {
  const [openId, setOpenId] = useQueryState<string>(EXCHANGE_RATE_ID_QUERY_KEY);
  const [detail, setDetail] = useAtom(exchangeRateDetailAtom);

  const form = useExchangeRateForm();
  const { reset } = form;

  useEffect(() => {
    if (detail) {
      reset({
        date: detail.date ? new Date(detail.date) : new Date(),
        mainCurrency: detail.mainCurrency || '',
        rateCurrency: detail.rateCurrency || '',
        rate: detail.rate || 0,
      });
    }
  }, [detail, reset]);

  const [editExchangeRate, { loading }] = useMutation(
    mutations.exchangeRateEdit,
    {
      refetchQueries: [EXCHANGE_RATES_QUERY_NAME],
    },
  );

  const close = () => {
    setOpenId(null);
    setDetail(null);
  };

  const handleSubmit = async (values: TExchangeRateForm) => {
    if (!openId) return;
    try {
      await editExchangeRate({ variables: { _id: openId, ...values } });
      notifySuccess('Exchange rate updated');
      close();
    } catch (e) {
      notifyError(e);
    }
  };

  return (
    <Sheet open={!!openId} onOpenChange={(value) => !value && close()}>
      <ExchangeRateSheetContent
        title="Edit Exchange Rate"
        formId={FORM_ID}
        form={form}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </Sheet>
  );
};
