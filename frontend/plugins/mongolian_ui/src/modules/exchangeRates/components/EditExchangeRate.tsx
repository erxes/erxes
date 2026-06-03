import { useMutation } from '@apollo/client';
import { Button, Sheet, Spinner, useQueryState } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mutations } from '../graphql';
import {
  EXCHANGE_RATE_DEFAULT_VALUES,
  EXCHANGE_RATE_ID_QUERY_KEY,
  EXCHANGE_RATES_QUERY_NAME,
  exchangeRateFormSchema,
  TExchangeRateForm,
} from '../constants';
import { exchangeRateDetailAtom } from '../states/exchangeRatesStates';
import { notifyError, notifySuccess } from '../utils';
import { ExchangeRateFormFields } from './ExchangeRateFormFields';

const FORM_ID = 'edit-exchange-rate-form';

export const EditExchangeRate = () => {
  const [openId, setOpenId] = useQueryState<string>(
    EXCHANGE_RATE_ID_QUERY_KEY,
  );
  const [detail, setDetail] = useAtom(exchangeRateDetailAtom);

  const form = useForm<TExchangeRateForm>({
    resolver: zodResolver(exchangeRateFormSchema),
    defaultValues: EXCHANGE_RATE_DEFAULT_VALUES,
  });

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
      <Sheet.View className="bg-background sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>Edit Exchange Rate</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <ExchangeRateFormFields
            form={form}
            formId={FORM_ID}
            onSubmit={handleSubmit}
          />
        </div>
        <Sheet.Footer className="gap-2 border-t bg-background">
          <Sheet.Close asChild>
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Sheet.Close>
          <Button type="submit" form={FORM_ID} size="lg" disabled={loading}>
            {loading ? <Spinner /> : 'Save'}
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};
