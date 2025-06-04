import React from 'react';
import Polaris from '../components/index';
import { IContractDoc, savingHistoryQueryResponse } from '../types';
import { mutations, queries } from '../graphql';

import { gql, useApolloClient } from '@apollo/client';
import { Alert, Spinner } from '@erxes/ui/src';
import {
  SendLoansMutationResponse,
  SyncLoanCollateralsMutationResponse,
  SendSchedulesMutationResponse,
  ActiveLoanMutationResponse
} from '../types';
import { useQuery, useMutation } from '@apollo/client';

type Props = {
  contract: IContractDoc;
};

const PolarisListContainer = (props: Props) => {
  const client = useApolloClient();
  const { contract } = props;

  const savingHistoryQuery = useQuery<savingHistoryQueryResponse>(
    gql(queries.SyncSavingsData),
    {
      variables: {
        contentType: 'loans:contract',
        contentId: contract._id
      }
    }
  );

  const [sendSavings] = useMutation<SendLoansMutationResponse>(
    gql(mutations.sendSaving),
    {
      refetchQueries: ['contractDetail', 'syncSavingsData']
    }
  );

  const [syncLoanCollateral] = useMutation<SyncLoanCollateralsMutationResponse>(
    gql(mutations.syncLoanCollateral),
    {
      refetchQueries: ['contractDetail', 'syncSavingsData']
    }
  );

  const [sendLoanSchedules] = useMutation<SendSchedulesMutationResponse>(
    gql(mutations.sendLoanSchedules),
    {
      refetchQueries: ['contractDetail', 'syncSavingsData']
    }
  );

  const [activeLoan] = useMutation<ActiveLoanMutationResponse>(
    gql(mutations.loanContractActive),
    {
      refetchQueries: ['contractDetail', 'syncSavingsData']
    }
  );
  const regenPolarisHandler = (data: any) => {
    sendSavings({ variables: { data } })
      .then(() => {
        Alert.success('Successfully synced');
      })
      .catch((error) => {
        Alert.error(error.message);

        client.refetchQueries({
          include: ['syncSavingsData']
        });
      });
  };

  const syncCollateralHandler = (data: any) => {
    syncLoanCollateral({ variables: { data } })
      .then(() => {
        Alert.success('Successfully synced');
      })
      .catch((error) => {
        Alert.error(error.message);

        client.refetchQueries({
          include: ['syncSavingsData']
        });
      });
  };

  const sendSchedulesHandler = (data: any) => {
    sendLoanSchedules({ variables: { data } })
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

        client.refetchQueries({
          include: ['syncSavingsData']
        });
      });
  };

  if (savingHistoryQuery.loading) {
    return <Spinner objective={true} />;
  }

  const savingHistories =
    savingHistoryQuery?.data?.syncSavingsData || ([] as any);

  const updatedProps = {
    ...props,
    savingHistories,
    reSendContract: regenPolarisHandler,
    reSendCollateral: syncCollateralHandler,
    reSendSchedules: sendSchedulesHandler,
    activeLoan: activeLoanHandler
  };

  return <Polaris {...updatedProps} />;
};

export default PolarisListContainer;
