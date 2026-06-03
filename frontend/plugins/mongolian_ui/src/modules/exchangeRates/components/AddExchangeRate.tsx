import { useMutation } from '@apollo/client';
import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { mutations } from '../graphql';
import {
  EXCHANGE_RATE_DEFAULT_VALUES,
  EXCHANGE_RATES_QUERY_NAME,
  exchangeRateFormSchema,
  TExchangeRateForm,
} from '../constants';
import { notifyError, notifySuccess } from '../utils';
import { ExchangeRateFormFields } from './ExchangeRateFormFields';

const FORM_ID = 'add-exchange-rate-form';

export const AddExchangeRate = () => {
  const [open, setOpen] = useState(false);

  const form = useForm<TExchangeRateForm>({
    resolver: zodResolver(exchangeRateFormSchema),
    defaultValues: EXCHANGE_RATE_DEFAULT_VALUES,
  });

  const [addExchangeRate, { loading }] = useMutation(
    mutations.exchangeRateAdd,
    {
      refetchQueries: [EXCHANGE_RATES_QUERY_NAME],
    },
  );

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
      <Sheet.View className="bg-background sm:max-w-lg">
        <Sheet.Header>
          <Sheet.Title>Add Exchange Rate</Sheet.Title>
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
