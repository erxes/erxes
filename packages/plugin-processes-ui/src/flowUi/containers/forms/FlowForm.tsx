import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React, { useState } from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';

import { IUser } from '@erxes/ui/src/auth/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IRouterProps } from '@erxes/ui/src/types';
import { Alert, router, withProps } from '@erxes/ui/src/utils';

import {
  mutations as flowMutations,
  queries as flowQueries
} from '../../../flow/graphql';
import {
  FlowDetailQueryResponse,
  FlowsEditMutationResponse,
  IFlowDocument
} from '../../../flow/types';
import { queries as jobQueries } from '../../../job/graphql';
import { JobRefersAllQueryResponse } from '../../../job/types';
import FlowForm from '../../components/forms/FlowForm';

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

  const flowDetail = flowDetailQuery.flowDetail;
  const jobRefers = jobRefersAllQuery.jobRefersAll || [];

  const updatedProps = {
    ...props,
    flow: flowDetail,
    currentUser,
    save,
    saveLoading,
    jobRefers
  };

  return <FlowForm {...updatedProps} />;
};

const refetchQueries = [
  'flows',
  'automationsMain',
  'flowDetail',
  'jobRefersAll'
];

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
          refetchQueries
        })
      }
    )
  )(withRouter<FinalProps>(AutomationDetailsContainer))
);
