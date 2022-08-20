import { Alert, EmptyState, Spinner, withProps } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { IRouterProps } from '@erxes/ui/src/types';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import AdjustmentDetails from '../components/AdjustmentDetails';
import { mutations, queries } from '../graphql';
import {
  DetailQueryResponse,
  EditMutationResponse,
  IAdjustment,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  id: string;
};

type FinalProps = {
  adjustmentDetailQuery: DetailQueryResponse;
  currentUser: IUser;
} & Props &
  IRouterProps &
  EditMutationResponse &
  RemoveMutationResponse;

const AdjustmentDetailsContainer = (props: FinalProps) => {
  const { adjustmentDetailQuery, currentUser, history } = props;

  const saveItem = (doc: IAdjustment, callback: (item) => void) => {
    const { adjustmentsEdit } = props;

    adjustmentsEdit({ variables: { ...doc } })
      .then(({ data }) => {
        if (callback) {
          callback(data.adjustmentsEdit);
        }
        Alert.success('You successfully updated contract type');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const remove = () => {
    const { id, adjustmentsRemove, history } = props;

    adjustmentsRemove({ variables: { adjustmentIds: [id] } })
      .then(() => {
        Alert.success('You successfully deleted a contract');
        history.push('/erxes-plugin-loan/contract-types');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  if (adjustmentDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!adjustmentDetailQuery.adjustmentDetail) {
    return (
      <EmptyState text="Contract not found" image="/images/actions/24.svg" />
    );
  }

  const adjustmentDetail = adjustmentDetailQuery.adjustmentDetail;

  const updatedProps = {
    ...props,
    loading: adjustmentDetailQuery.loading,
    adjustment: adjustmentDetail,
    currentUser,
    saveItem,
    remove
  };

  return <AdjustmentDetails {...updatedProps} />;
};

const generateOptions = () => ({
  refetchQueries: ['adjustmentDetail']
});
const removeOptions = () => ({
  refetchQueries: ['adjustmentsMain']
});

export default withProps<Props>(
  compose(
    graphql<Props, DetailQueryResponse, { _id: string }>(
      gql(queries.adjustmentDetail),
      {
        name: 'adjustmentDetailQuery',
        options: ({ id }) => ({
          variables: {
            _id: id
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<{}, EditMutationResponse, IAdjustment>(
      gql(mutations.adjustmentsEdit),
      {
        name: 'adjustmentsEdit',
        options: generateOptions
      }
    ),
    graphql<{}, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.adjustmentsRemove),
      {
        name: 'adjustmentsRemove',
        options: removeOptions
      }
    )
  )(withRouter<FinalProps>(AdjustmentDetailsContainer))
);
