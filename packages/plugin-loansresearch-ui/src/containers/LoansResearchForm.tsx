import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { mutations } from '../graphql';
import LoansResearchForm from '../components/LoansResearchForm';
import { ILoanResearch } from '../types';

type Props = {
  loansResearch: ILoanResearch;
  closeModal: () => void;
};

const LoansResearchFormContainer = (props: Props) => {
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
          object ? mutations.loansResearchEdit : mutations.loansResearchAdd
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
  return <LoansResearchForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['loansResearchMain', 'loansResearchDetail'];
};

export default LoansResearchFormContainer;
