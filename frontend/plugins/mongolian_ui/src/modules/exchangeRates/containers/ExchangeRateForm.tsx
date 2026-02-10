import { useMutation, useQuery } from '@apollo/client';

import ExchangeRateForm from '../components/ExchangeRateForm';
import {
  IExchangeRate,
  ExchangeRateFormValues,
} from '../types';

import { queries } from '../graphql/index';
import { mutations } from '../graphql/index';

type Props = {
  exchangeRate?: IExchangeRate;
};

const ExchangeRateFormContainer = ({
  exchangeRate,
}: Props) => {


  const { data, loading } = useQuery(
    queries.configs,
    {
      variables: { code: 'dealCurrency' },
      fetchPolicy: 'network-only',
    }
  );

  const currencies: string[] =
    data?.configsGetValue?.value || [];



  const [addExchangeRate, { loading: adding }] =
    useMutation(mutations.exchangeRateAdd, {
      refetchQueries: ['exchangeRatesMain'],
    });

  const [editExchangeRate, { loading: editing }] =
    useMutation(mutations.exchangeRateEdit, {
      refetchQueries: ['exchangeRatesMain'],
    });


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
