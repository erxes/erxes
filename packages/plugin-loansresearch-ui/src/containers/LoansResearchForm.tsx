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
  const deepCleanTypename = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(deepCleanTypename); // Recursively clean arrays
    } else if (obj && typeof obj === 'object') {
      const { __typename, ...rest } = obj; // Remove __typename
      return Object.keys(rest).reduce((cleaned, key) => {
        cleaned[key] = deepCleanTypename(rest[key]); // Recursively clean nested objects
        return cleaned;
      }, {});
    }
    return obj; // Return primitive values as-is
  };

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback,
    object,
  }: IButtonMutateProps) => {
    const cleanedVariables = deepCleanTypename(values);

    return (
      <ButtonMutate
        mutation={
          object ? mutations.loansResearchEdit : mutations.loansResearchAdd
        }
        variables={cleanedVariables}
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
  return ['loansResearchMain'];
};

export default LoansResearchFormContainer;
