import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { mutations } from '../graphql';
import { IExchangeRate } from '../types';
import ExchangeRateForm from '../components/ExchangeRateForm';

type Props = {
  exchangeRate?: IExchangeRate;
  closeModal: () => void;
};

const ExchangeRateFormContainer = (props: Props) => {
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

  const updatedProps = {
    ...props,
    renderButton,
  };
  return <ExchangeRateForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['exchangeRatesMain'];
};

export default ExchangeRateFormContainer;
