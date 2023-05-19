import { Alert, EmptyState, Spinner, router, withProps } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { IRouterProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import PeriodLockDetails from '../components/PeriodLockDetails';
import { mutations, queries } from '../graphql';
import {
  DetailQueryResponse,
  EditMutationResponse,
  IPeriodLock,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  id: string;
};

type FinalProps = {
  periodLockDetailQuery: DetailQueryResponse;
  currentUser: IUser;
} & Props &
  IRouterProps &
  EditMutationResponse &
  RemoveMutationResponse;

const PeriodLockDetailsContainer = (props: FinalProps) => {
  const { periodLockDetailQuery, currentUser } = props;

  const saveItem = (doc: IPeriodLock, callback: (item) => void) => {
    const { periodLocksEdit } = props;

    periodLocksEdit({ variables: { ...doc } })
      .then(({ data }) => {
        if (callback) {
          callback(data.periodLocksEdit);
        }
        Alert.success('You successfully updated contract type');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const remove = () => {
    const { id, periodLocksRemove, history } = props;

    periodLocksRemove({ variables: { periodLockIds: [id] } })
      .then(() => {
        Alert.success('You successfully deleted a contract');
        history.push('/erxes-plugin-loan/contract-types');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  if (periodLockDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!periodLockDetailQuery.periodLockDetail) {
    return (
      <EmptyState text="Period Lock not found" image="/images/actions/24.svg" />
    );
  }

  const periodLockDetail = periodLockDetailQuery.periodLockDetail;

  const updatedProps = {
    ...props,
    loading: periodLockDetailQuery.loading,
    periodLock: periodLockDetail,
    currentUser,
    saveItem,
    remove
  };

  return <PeriodLockDetails {...(updatedProps as any)} />;
};

const generateOptions = () => ({
  refetchQueries: ['periodLockDetail']
});
const removeOptions = () => ({
  refetchQueries: ['periodLocksMain']
});

export default withProps<Props>(
  compose(
    graphql<any, DetailQueryResponse, { _id: string }>(
      gql(queries.periodLockDetail),
      {
        name: 'periodLockDetailQuery',
        options: ({ id }) => {
          return {
            variables: {
              _id: id
            },
            fetchPolicy: 'network-only'
          };
        }
      }
    ),
    graphql<{}, EditMutationResponse, IPeriodLock>(
      gql(mutations.periodLocksEdit),
      {
        name: 'periodLocksEdit',
        options: generateOptions
      }
    ),
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.periodLocksRemove),
      {
        name: 'periodLocksRemove',
        options: removeOptions
      }
    )
  )(withRouter<FinalProps>(PeriodLockDetailsContainer))
);
