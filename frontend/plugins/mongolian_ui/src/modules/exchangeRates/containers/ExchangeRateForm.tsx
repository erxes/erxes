import { useMutation, useQuery } from '@apollo/client';

import ExchangeRateForm from './ExchangeRateForm';
import {
  IExchangeRate,
  ExchangeRateFormValues,
} from '../types';

import { queries } from '../graphql/index';
import { mutations } from '../graphql/index';

type Props = {
  exchangeRate?: IExchangeRate;
currencies: string[];
  submitting?: boolean;
  onSubmit: (values: ExchangeRateFormValues) => void;
};

const ExchangeRateFormContainer = ({
  exchangeRate,
}: Props) => {
  /* -------- configs query -------- */

  const { data, loading } = useQuery(
    queries.configs,
    {
      variables: { code: 'dealCurrency' },
      fetchPolicy: 'network-only',
    }
  );

  const currencies: string[] =
    data?.configsGetValue?.value || [];

  /* -------- mutations -------- */

  const [addExchangeRate, { loading: adding }] =
    useMutation(mutations.exchangeRateAdd, {
      refetchQueries: ['exchangeRatesMain'],
    });

  const [editExchangeRate, { loading: editing }] =
    useMutation(mutations.exchangeRateEdit, {
      refetchQueries: ['exchangeRatesMain'],
    });

  /* -------- submit -------- */

  const handleSubmit = async (
    values: ExchangeRateFormValues,
  ) => {
    if (exchangeRate?._id) {
      await editExchangeRate({
        variables: {
          _id: exchangeRate._id,
          ...values,
        },
      });
    } else {
      await addExchangeRate({
        variables: values,
      });
    }
  };

  if (loading) {
    return null;
  }

  return (
    <ExchangeRateForm
      exchangeRate={exchangeRate}
      currencies={currencies}
      onSubmit={handleSubmit}
      submitting={adding || editing}
    />
  );
};

export default ExchangeRateFormContainer;
