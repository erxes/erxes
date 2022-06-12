import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Spinner from '@erxes/ui/src/components/Spinner';
import { router, withProps, Alert } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { graphql } from 'react-apollo';
import { IUser } from '@erxes/ui/src/auth/types';
import FlowForm from '../../components/forms/FlowForm';
import {
  queries as flowQueries,
  mutations as flowMutations
} from '../../../flow/graphql';
import { queries as jobQueries } from '../../../job/graphql';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  FlowDetailQueryResponse,
  FlowsEditMutationResponse,
  FlowsAddMutationResponse,
  IFlowDocument
} from '../../../flow/types';
import { JobRefersAllQueryResponse } from '../../../job/types';

type Props = {
  id: string;
  queryParams: any;
};

type FinalProps = {
  flowDetailQuery: FlowDetailQueryResponse;
  jobRefersAllQuery: JobRefersAllQueryResponse;
  currentUser: IUser;
  saveAsTemplateMutation: any;
} & Props &
  FlowsEditMutationResponse &
  FlowsAddMutationResponse &
  IRouterProps;

const AutomationDetailsContainer = (props: FinalProps) => {
  const {
    flowDetailQuery,
    currentUser,
    history,
    flowsEdit,
    jobRefersAllQuery
  } = props;

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

  if (flowDetailQuery.loading || jobRefersAllQuery.loading) {
    return <Spinner objective={true} />;
  }

  const flowDetail = flowDetailQuery.flowDetail || ({} as IFlowDocument);

  const jobRefers = jobRefersAllQuery.jobRefersAll || [];

  const updatedProps = {
    ...props,
    loading: flowDetailQuery.loading,
    flow: flowDetail,
    currentUser,
    save,
    saveLoading,
    jobRefers
  };

  return <FlowForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, JobRefersAllQueryResponse>(gql(jobQueries.jobRefersAll), {
      name: 'jobRefersAllQuery'
    }),
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
          refetchQueries: [
            'flows',
            'automationsMain',
            'flowDetail',
            'jobRefersAll'
          ]
        })
      }
    ),
    graphql<{}, FlowsAddMutationResponse, IFlowDocument>(
      gql(flowMutations.flowsAdd),
      {
        name: 'flowsAdd',
        options: () => ({
          refetchQueries: [
            'flows',
            'automationsMain',
            'flowDetail',
            'jobRefersAll'
          ]
        })
      }
    )
  )(withRouter<FinalProps>(AutomationDetailsContainer))
);
