import { EmptyState, Spinner } from '@erxes/ui/src';
import { gql, useQuery } from '@apollo/client';

import { DetailQueryResponse } from '../../types';
import React from 'react';
import { queries } from '../../graphql';
import LoansResearchDetails from '../../components/detail/LoansResearchDetails';

type Props = {
  id: string;
};

const LoansResearchDetailsContainers = (props: Props) => {
  const { id } = props;

  const loanResearchDetailQuery = useQuery<DetailQueryResponse>(
    gql(queries.loansResearchDetail),
    {
      variables: {
        _id: id,
      },
    }
  );

  if (loanResearchDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!loanResearchDetailQuery?.data?.loansResearchDetail) {
    return (
      <EmptyState
        text="Loan research not found"
        image="/images/actions/24.svg"
      />
    );
  }

  const loansResearchDetail =
    loanResearchDetailQuery?.data?.loansResearchDetail;

  const updatedProps = {
    ...props,
    loading: loanResearchDetailQuery.loading,
    loansResearch: loansResearchDetail,
  };

  return <LoansResearchDetails {...updatedProps} />;
};

export default LoansResearchDetailsContainers;
