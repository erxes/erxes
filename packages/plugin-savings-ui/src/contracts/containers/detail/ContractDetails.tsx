import { Alert, EmptyState, Spinner, withProps } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import ContractDetails from '../../components/detail/ContractDetails';
import { mutations, queries } from '../../graphql';
import {
  DetailQueryResponse,
  EditMutationResponse,
  IContractDoc,
  RegenSchedulesMutationResponse
} from '../../types';

type Props = {
  id: string;
};

type FinalProps = {
  contractDetailQuery: DetailQueryResponse;
  currentUser: IUser;
} & Props &
  EditMutationResponse &
  RegenSchedulesMutationResponse;

const ContractDetailsContainer = (props: FinalProps) => {
  const { contractDetailQuery, currentUser } = props;

  const saveItem = (doc: IContractDoc, callback: (item) => void) => {
    const { contractsEdit } = props;

    contractsEdit({ variables: { ...doc } })
      .then(({ data }) => {
        if (callback) {
          callback(data.contractsEdit);
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const regenSchedules = (contractId: string) => {
    props.regenSchedules({ variables: { contractId } }).catch(error => {
      Alert.error(error.message);
    });
  };

  const fixSchedules = (contractId: string) => {
    props.fixSchedules({ variables: { contractId } }).catch(error => {
      Alert.error(error.message);
    });
  };

  if (contractDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!contractDetailQuery.savingsContractDetail) {
    return (
      <EmptyState text="Contract not found" image="/images/actions/24.svg" />
    );
  }

  const contractDetail = contractDetailQuery.savingsContractDetail;

  const updatedProps: any = {
    ...props,
    loading: contractDetailQuery.loading,
    contract: contractDetail,
    currentUser,
    saveItem,
    regenSchedules,
    fixSchedules
  };

  return <ContractDetails {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: ['contractDetail']
});

export default withProps<Props>(
  compose(
    graphql<Props, DetailQueryResponse, { _id: string }>(
      gql(queries.contractDetail),
      {
        name: 'contractDetailQuery',
        options: ({ id }) => ({
          variables: {
            _id: id
          }
        })
      }
    ),
    graphql<{}, EditMutationResponse, IContractDoc>(
      gql(mutations.contractsEdit),
      {
        name: 'contractsEdit',
        options: generateOptions
      }
    ),
    graphql<{}, RegenSchedulesMutationResponse, { contractId: string }>(
      gql(mutations.regenSchedules),
      {
        name: 'regenSchedules',
        options: {
          refetchQueries: ['schedules', 'scheduleYears']
        }
      }
    ),
    graphql<{}, RegenSchedulesMutationResponse, { contractId: string }>(
      gql(mutations.fixSchedules),
      {
        name: 'fixSchedules',
        options: {
          refetchQueries: ['schedules', 'scheduleYears']
        }
      }
    )
  )(ContractDetailsContainer)
);
