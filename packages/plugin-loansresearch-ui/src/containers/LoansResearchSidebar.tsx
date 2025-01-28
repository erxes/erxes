import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import { mutations, queries } from '../graphql';
import { DetailQueryResponse, ILoanResearch } from '../types';
import LoansResearchSidebar from '../components/LoansResearchSidebar';

type Props = {
  closeModal: () => void;
};

const LoansResearchSidebarContainer = (props: Props) => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  const loansResearchMainQuery = useQuery<DetailQueryResponse>(
    gql(queries.loanResearchDetail),
    {
      variables: {
        dealId: queryParams.itemId,
      },
    }
  );

  if (loansResearchMainQuery.loading) {
    return <Spinner />;
  }

  const loansResearch =
    loansResearchMainQuery?.data?.loanResearchDetail || ({} as ILoanResearch);

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
    loansResearch,
    renderButton,
  };
  return <LoansResearchSidebar {...updatedProps} />;
};

const getRefetchQueries = () => {
  return ['loansResearchMain'];
};

export default LoansResearchSidebarContainer;
