import { Alert, ButtonMutate, Spinner } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';

import { mutations, queries } from '../graphql';
import LoansResearchForm from '../components/LoansResearchForm';
import { ILoanResearch, RefetchMutationResponse } from '../types';

type Props = {
  loansResearch: ILoanResearch;
  closeModal: () => void;
  queryParams: any;
};

const LoansResearchFormContainer = (props: Props) => {
  const { queryParams } = props;

  const [loanResearchRefetch] = useMutation<RefetchMutationResponse>(
    gql(mutations.loansResearchRefetch),
    {
      refetchQueries: ['loanResearchDetail'],
    }
  );

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

  const customersQuery = useQuery(gql(queries.customers), {
    variables: {
      mainType: 'deal',
      mainTypeId: queryParams?.itemId || '',
      relType: 'customer',
      isSaved: true,
    },
  });

  if (customersQuery.loading) {
    return <Spinner />;
  }

  const refetchResearch = (customerId, type) => {
    loanResearchRefetch({
      variables: { customerId, type },
    })
      .then(() => {
        Alert.success('You successfully refetched the research');
      })
      .catch((e) => {
        Alert.error(e.message);
      });
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
    refetchResearch,
    customer: customersQuery?.data?.customers[0] || {},
  };
  return <LoansResearchForm {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['loansResearchMain'];
};

export default LoansResearchFormContainer;
