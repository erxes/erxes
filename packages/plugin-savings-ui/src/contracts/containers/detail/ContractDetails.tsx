import { Alert, EmptyState, Spinner } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { gql } from '@apollo/client';
import React, { useEffect } from 'react';
import ContractDetails from '../../components/detail/ContractDetails';
import { mutations, queries } from '../../graphql';
import {
  DetailQueryResponse,
  SavingsActiveMutationResponse,
  SavingsMutationResponse,
} from '../../types';
import { useQuery, useMutation } from '@apollo/client';
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
        _id: id,
      },
    }
  );

  useEffect(() => {
    contractDetailQuery.subscribeToMore({
      document: gql(subscriptions.savingsContractChanged),
      variables: { ids: [id] },
      updateQuery: (prev) => {
        contractDetailQuery.refetch();
        return prev;
      },
    });
  }, []);

  const [sendSavings] = useMutation<SavingsMutationResponse>(
    gql(mutations.sendSaving),
    {
      refetchQueries: ['savingsContractDetail'],
    }
  );

  const [savingActive] = useMutation<SavingsActiveMutationResponse>(
    gql(mutations.savingActive),
    {
      refetchQueries: ['savingsContractDetail'],
    }
  );

  const regenPolarisHandler = (data: any) => {
    sendSavings({ variables: { data } })
      .then(() => {
        Alert.success('Successfully synced');
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const savingActiveHandler = (contractNumber: string) => {
    savingActive({ variables: { contractNumber } })
      .then(() => {
        Alert.success('Successfully activated');
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

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
    currentUser,
    reSendContract: regenPolarisHandler,
    savingActive: savingActiveHandler,
  };

  return <ContractDetails {...updatedProps} />;
};

export default ContractDetailsContainer;
