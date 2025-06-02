import Alert from '@erxes/ui/src/utils/Alert';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';

import { IUser } from '@erxes/ui/src/auth/types';
import { gql } from '@apollo/client';
import React, { useEffect } from 'react';
import ContractDetails from '../../components/detail/ContractDetails';
import { mutations, queries } from '../../graphql';
import {
  ActiveLoanMutationResponse,
  DetailQueryResponse,
  EditMutationResponse,
  IContractDoc,
  RegenSchedulesMutationResponse
} from '../../types';
import { useMutation, useQuery } from '@apollo/client';
import subscriptions from '../../graphql/subscriptions';

type Props = {
  id: string;
};

type FinalProps = {
  currentUser: IUser;
} & Props;

const ContractDetailsContainer = (props: FinalProps) => {
  const { currentUser, id } = props;
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
      document: gql(subscriptions.loansContractChanged),
      variables: { ids: [id] },
      updateQuery: (prev) => {
        contractDetailQuery.refetch();
        return prev;
      }
    });
  }, []);

  const [contractsEdit] = useMutation<EditMutationResponse>(
    gql(mutations.contractsEdit),
    {
      refetchQueries: ['contractDetail']
    }
  );

  const [regenSchedules] = useMutation<RegenSchedulesMutationResponse>(
    gql(mutations.regenSchedules),
    {
      refetchQueries: ['schedules', 'scheduleYears']
    }
  );

  const [fixSchedules] = useMutation<RegenSchedulesMutationResponse>(
    gql(mutations.fixSchedules),
    {
      refetchQueries: ['schedules', 'scheduleYears']
    }
  );

  const [sendSavings] = useMutation<SendLoansMutationResponse>(
    gql(mutations.sendSaving),
    {
      refetchQueries: ['contractDetail'],
    }
  );

  const [syncLoanCollateral] = useMutation<SyncLoanCollateralsMutationResponse>(
    gql(mutations.syncLoanCollateral),
    {
      refetchQueries: ['contractDetail'],
    }
  );

  const [sendLoanSchedules] = useMutation<SendSchedulesMutationResponse>(
    gql(mutations.sendLoanSchedules),
    {
      refetchQueries: ['contractDetail'],
    }
  );

  const [activeLoan] = useMutation<ActiveLoanMutationResponse>(
    gql(mutations.loanContractActive),
    {
      refetchQueries: ['contractDetail'],
    }
  );

  const saveItem = (doc: IContractDoc, callback: (item) => void) => {
    contractsEdit({ variables: { ...doc } })
      .then(({ data }) => {
        if (callback) {
          callback((data || {}).contractsEdit);
        }
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const regenSchedulesHandler = (contractId: string) => {
    regenSchedules({ variables: { contractId } }).catch((error) => {
      Alert.error(error.message);
    });
  };

  const fixSchedulesHandler = (contractId: string) => {
    fixSchedules({ variables: { contractId } }).catch((error) => {
      Alert.error(error.message);
    });
  };

  const regenPolarisHandler = (data: any) => {
    sendSavings({ variables: { data } })
      .then(() => {
        Alert.success('Successfully synced');
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const syncCollateralHandler = (contract: any) => {
    syncLoanCollateral({ variables: { contract } })
      .then(() => {
        Alert.success('Successfully synced');
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const sendSchedulesHandler = (contract: any) => {
    sendLoanSchedules({ variables: { contract } })
      .then(() => {
        Alert.success('Successfully synced');
      })
      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const activeLoanHandler = (contractNumber: string) => {
    activeLoan({ variables: { contractNumber } })
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

  if (!contractDetailQuery?.data?.contractDetail) {
    return (
      <EmptyState text="Contract not found" image="/images/actions/24.svg" />
    );
  }

  const contractDetail = contractDetailQuery?.data?.contractDetail;

  const updatedProps: any = {
    ...props,
    loading: contractDetailQuery.loading,
    contract: contractDetail,
    currentUser,
    saveItem,
    regenSchedules: regenSchedulesHandler,
    fixSchedules: fixSchedulesHandler
  };

  return <ContractDetails {...updatedProps} />;
};

export default ContractDetailsContainer;
