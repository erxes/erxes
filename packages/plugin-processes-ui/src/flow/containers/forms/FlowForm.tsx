import * as compose from 'lodash.flowright';
import FlowForm from '../../components/forms/FlowForm';
import gql from 'graphql-tag';
import React, { useState } from 'react';
import { Alert, router, withProps } from '@erxes/ui/src/utils';
import {
  FlowDetailQueryResponse,
  FlowsEditMutationResponse,
  IFlowDocument
} from '../../../flow/types';
import { graphql } from 'react-apollo';
import { IRouterProps } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import {
  mutations as flowMutations,
  queries as flowQueries
} from '../../../flow/graphql';
import { withRouter } from 'react-router-dom';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  id: string;
  queryParams: any;
};

type FinalProps = {
  flowDetailQuery: FlowDetailQueryResponse;
  currentUser: IUser;
  saveAsTemplateMutation: any;
} & Props &
  FlowsEditMutationResponse &
  IRouterProps;

const FlowDetailsContainer = (props: FinalProps) => {
  const { flowDetailQuery, currentUser, history, flowsEdit } = props;

  const [saveLoading, setLoading] = useState(false);

  const save = (doc: IFlowDocument) => {
    setLoading(true);

    flowsEdit({
      variables: {
        ...doc
      }
    })
      .then(() => {
        router.removeParams(history, 'isCreate');

        setTimeout(() => {
          setLoading(false);
        }, 300);

        Alert.success(`You successfully updated a ${doc.name || 'status'}`);
      })

      .catch(error => {
        Alert.error(error.message);
      });
  };

  if (flowDetailQuery.loading) {
    return <Spinner />;
  }
  const flowDetail = flowDetailQuery.flowDetail || {};

  const updatedProps = {
    ...props,
    flow: flowDetail,
    currentUser,
    save,
    saveLoading
  };

  return <FlowForm {...updatedProps} />;
};

const refetchQueries = ['flows', 'flowDetail', 'jobRefersAll'];

export default withProps<Props>(
  compose(
    graphql<Props, FlowDetailQueryResponse, { _id: string }>(
      gql(flowQueries.flowDetail),
      {
        name: 'flowDetailQuery',
        options: ({ id }) => ({
          variables: {
            _id: id
          }
        })
      }
    ),
    graphql<{}, FlowsEditMutationResponse, IFlowDocument>(
      gql(flowMutations.flowsEdit),
      {
        name: 'flowsEdit',
        options: () => ({
          refetchQueries
        })
      }
    )
  )(withRouter<FinalProps>(FlowDetailsContainer))
);
