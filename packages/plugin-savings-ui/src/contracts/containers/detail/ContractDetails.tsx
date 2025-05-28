import { EmptyState, Spinner } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { gql } from '@apollo/client';
import React, { useEffect } from 'react';
import ContractDetails from '../../components/detail/ContractDetails';
import { queries } from '../../graphql';
import { DetailQueryResponse } from '../../types';
import { useQuery } from '@apollo/client';
import subscriptions from '../../graphql/subscriptions';

type Props = {
  id: string;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ContractDetailsContainer = (props: FinalProps) => {
  const { id, currentUser } = props;

  const contractDetailQuery = useQuery<DetailQueryResponse>(
    gql(queries.contractDetail),
    {
      variables: {
        _id: id
      }
    }
  );

  useEffect(() => {
    contractDetailQuery.subscribeToMore({
      document: gql(subscriptions.savingsContractChanged),
      variables: { ids: [id] },
      updateQuery: (prev) => {
        contractDetailQuery.refetch();
        return prev;
      }
    });
  }, []);

  if (contractDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!contractDetailQuery?.data?.savingsContractDetail) {
    return (
      <EmptyState text="Contract not found" image="/images/actions/24.svg" />
    );
  }

  const contractDetail = contractDetailQuery?.data?.savingsContractDetail;

  const updatedProps: any = {
    ...props,
    loading: contractDetailQuery.loading,
    contract: contractDetail,
    currentUser
  };

  return <ContractDetails {...updatedProps} />;
};

export default ContractDetailsContainer;
