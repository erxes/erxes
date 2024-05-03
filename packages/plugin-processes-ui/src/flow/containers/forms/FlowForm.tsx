import * as compose from 'lodash.flowright';

import { Alert, router, withProps } from '@erxes/ui/src/utils';
import {
  FlowDetailQueryResponse,
  FlowsAddMutationResponse,
  FlowsEditMutationResponse,
  IFlow,
  IFlowDocument,
} from '../../../flow/types';
import React, { useState } from 'react';
import {
  mutations as flowMutations,
  queries as flowQueries,
} from '../../../flow/graphql';

import FlowForm from '../../components/forms/FlowForm';
import { IUser } from '@erxes/ui/src/auth/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { useNavigate } from 'react-router-dom';

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
  FlowsAddMutationResponse;

const FlowDetailsContainer = (props: FinalProps) => {
  const navigate = useNavigate();
  const { flowDetailQuery, currentUser, flowsEdit, flowsAdd } = props;
  let flowDetail: IFlowDocument;

  const [saveLoading, setLoading] = useState(false);

  const copyFlow = (params: IFlowDocument) => {
    const variables: IFlow = { ...params };

    variables.name = `Copy Of ${variables.name}`;
    variables.status = 'draft';

    flowsAdd({
      variables,
    })
      .then((data) => {
        navigate({
          pathname: `/processes/flows/details/${data.data.flowsAdd._id}`,
          search: '?isCreate=true',
        });
      })

      .catch((error) => {
        Alert.error(error.message);
      });
  };

  const save = (doc: IFlowDocument) => {
    setLoading(true);

    flowsEdit({
      variables: {
        ...doc,
      },
    })
      .then((data) => {
        router.removeParams(history, 'isCreate');

        setTimeout(() => {
          setLoading(false);
        }, 300);

        Alert.success(`You successfully updated a ${doc.name || 'status'}`);
        flowDetail = data.data.flowsEdit;
      })

      .catch((error) => {
        Alert.error(error.message);
      });
  };

  if (flowDetailQuery.loading) {
    return <Spinner />;
  }

  flowDetail = flowDetailQuery.flowDetail || {};

  const updatedProps = {
    ...props,
    flow: flowDetail,
    currentUser,
    save,
    copyFlow,
    saveLoading,
  };

  return <FlowForm {...updatedProps} />;
};

const refetchQueries = ['flows', 'flowDetail'];

export default withProps<Props>(
  compose(
    graphql<Props, FlowDetailQueryResponse, { _id: string }>(
      gql(flowQueries.flowDetail),
      {
        name: 'flowDetailQuery',
        options: ({ id }) => ({
          variables: {
            _id: id,
          },
        }),
      },
    ),
    graphql<{}, FlowsEditMutationResponse, IFlowDocument>(
      gql(flowMutations.flowsEdit),
      {
        name: 'flowsEdit',
        options: () => ({
          refetchQueries,
        }),
      },
    ),
    graphql<{}, FlowsAddMutationResponse, IFlowDocument>(
      gql(flowMutations.flowsAdd),
      {
        name: 'flowsAdd',
        options: () => ({
          refetchQueries: ['flows', 'flowDetail'],
        }),
      },
    ),
  )(FlowDetailsContainer),
);
