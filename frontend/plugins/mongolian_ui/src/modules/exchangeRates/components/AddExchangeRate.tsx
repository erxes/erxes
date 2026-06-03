import { useMutation } from '@apollo/client';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { useState } from 'react';
import { mutations } from '../graphql';
import {
  EXCHANGE_RATE_DEFAULT_VALUES,
  EXCHANGE_RATES_QUERY_NAME,
  TExchangeRateForm,
} from '../constants';
import { useExchangeRateForm } from '../hooks/useExchangeRateForm';
import { notifyError, notifySuccess } from '../utils';
import { ExchangeRateSheetContent } from './ExchangeRateSheetContent';

const FORM_ID = 'add-exchange-rate-form';

export const AddExchangeRate = () => {
  const [open, setOpen] = useState(false);
  const form = useExchangeRateForm();

  const [addExchangeRate, { loading }] = useMutation(mutations.exchangeRateAdd, {
    refetchQueries: [EXCHANGE_RATES_QUERY_NAME],
  });

  const handleSubmit = async (values: TExchangeRateForm) => {
    try {
      await addExchangeRate({ variables: values });
      notifySuccess('Exchange rate created');
      setOpen(false);
      form.reset(EXCHANGE_RATE_DEFAULT_VALUES);
    } catch (e) {
      notifyError(e);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add Exchange Rate
        </Button>
      </Sheet.Trigger>
      <ExchangeRateSheetContent
        title="Add Exchange Rate"
        formId={FORM_ID}
        form={form}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </Sheet>
  );
};
