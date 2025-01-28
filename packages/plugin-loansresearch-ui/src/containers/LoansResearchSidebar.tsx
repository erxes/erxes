import React from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';
import { useLocation } from 'react-router-dom';
import queryString from 'query-string';
import { queries } from '../graphql';
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

  const updatedProps = {
    ...props,
    queryParams,
    loansResearch,
  };
  return <LoansResearchSidebar {...updatedProps} />;
};

export default LoansResearchSidebarContainer;
