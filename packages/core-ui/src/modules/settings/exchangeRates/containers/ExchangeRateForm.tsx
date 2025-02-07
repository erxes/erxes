import * as compose from 'lodash.flowright';
import { ButtonMutate } from '@erxes/ui/src';
import { withProps } from '@erxes/ui/src/utils';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { graphql } from '@apollo/client/react/hoc';
import React from 'react';
import { mutations, queries } from '../graphql';
import { ConfigsQueryResponse, IExchangeRate } from '../types';
import ExchangeRateForm from '../components/ExchangeRateForm';
import { gql } from '@apollo/client';

type Props = {
  exchangeRate?: IExchangeRate;
  closeModal: () => void;
};

type FinalProps = {
  configsQuery: ConfigsQueryResponse;
} & Props;

const ExchangeRateFormContainer = (props: FinalProps) => {
  const { configsQuery } = props;

  if (configsQuery.loading) {
    return null;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={
          object ? mutations.exchangeRateEdit : mutations.exchangeRateAdd
        }
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };
  const currencies = configsQuery.configsGetValue.value || [];

  const updatedProps = {
    ...props,
    renderButton,
    currencies,
  };
  return <ExchangeRateForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['exchangeRatesMain'];
};

export default withProps<Props>(
  compose(
    graphql<Props, ConfigsQueryResponse>(gql(queries.configs), {
      name: 'configsQuery',
      options: () => ({
        variables: {
          code: 'dealCurrency',
        },
        fetchPolicy: 'network-only',
      }),
    })
  )(ExchangeRateFormContainer)
);
