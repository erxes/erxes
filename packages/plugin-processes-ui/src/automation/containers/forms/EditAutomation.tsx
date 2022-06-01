import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import { router, withProps, Alert } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { graphql } from 'react-apollo';
import { IUser } from '@erxes/ui/src/auth/types';
import AutomationForm from '../../components/forms/AutomationForm';
import { queries, mutations } from '../../graphql';
import {
  queries as flowQueries,
  mutations as flowMutations
} from '../../../flow/graphql';
import {
  DetailQueryResponse,
  EditMutationResponse,
  IAutomation,
  AutomationsNoteQueryResponse
} from '../../types';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  FlowDetailQueryResponse,
  FlowsEditMutationResponse,
  FlowsAddMutationResponse,
  IFlowDocument
} from '../../../flow/types';

type Props = {
  id: string;
  queryParams: any;
};

type FinalProps = {
  flowDetailQuery: FlowDetailQueryResponse;
  automationDetailQuery: DetailQueryResponse;
  automationNotesQuery: AutomationsNoteQueryResponse;
  currentUser: IUser;
  saveAsTemplateMutation: any;
} & Props &
  FlowsEditMutationResponse &
  FlowsAddMutationResponse &
  IRouterProps;

const AutomationDetailsContainer = (props: FinalProps) => {
  const {
    flowDetailQuery,
    automationDetailQuery,
    automationNotesQuery,
    currentUser,
    history,
    flowsEditMutation,
    flowsAddMutation
  } = props;

  const [saveLoading, setLoading] = useState(false);

  const save = (doc: IFlowDocument) => {
    setLoading(true);

    flowsEditMutation({
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

  const add = (doc: IFlowDocument) => {
    setLoading(true);

    flowsAddMutation({
      variables: {
        ...doc
      }
    })
      .then(() => {
        router.removeParams(history, 'isCreate');

        setTimeout(() => {
          setLoading(false);
        }, 300);

        Alert.success(`You successfully added a ${doc.name || 'status'}`);
      })

      .catch(error => {
        Alert.error(error.message);
      });
  };

  if (
    flowDetailQuery.loading ||
    automationDetailQuery.loading ||
    automationNotesQuery.loading
  ) {
    return <Spinner objective={true} />;
  }

  // if (!flowDetailQuery.flowDetail) {
  //   return <EmptyState text="Flow not found" image="/images/actions/24.svg" />;
  // }

  const flowDetail = flowDetailQuery.flowDetail || ({} as IFlowDocument);

  const mutationAddEdit = Object.keys(flowDetail).length ? save : add;

  console.log('flowDetail', flowDetail);

  const automationNotes = automationNotesQuery.automationNotes || [];

  const updatedProps = {
    ...props,
    loading: flowDetailQuery.loading,
    automation: flowDetail,
    automationNotes,
    currentUser,
    save: mutationAddEdit,
    saveLoading
  };

  return <AutomationForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, DetailQueryResponse, { _id: string }>(
      gql(queries.automationDetail),
      {
        name: 'automationDetailQuery',
        options: ({ id }) => ({
          variables: {
            _id: id
          }
        })
      }
    ),
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
    graphql<Props, AutomationsNoteQueryResponse, { automationId: string }>(
      gql(queries.automationNotes),
      {
        name: 'automationNotesQuery',
        options: ({ id }) => ({
          variables: {
            automationId: id
          }
        })
      }
    ),
    graphql<{}, FlowsEditMutationResponse, IFlowDocument>(
      gql(flowMutations.flowsEdit),
      {
        name: 'flowsEditMutation',
        options: () => ({
          refetchQueries: ['flows', 'automationsMain', 'flowDetail']
        })
      }
    ),
    graphql<{}, FlowsAddMutationResponse, IFlowDocument>(
      gql(flowMutations.flowsAdd),
      {
        name: 'flowsAddMutation',
        options: () => ({
          refetchQueries: ['flows', 'automationsMain', 'flowDetail']
        })
      }
    )
  )(withRouter<FinalProps>(AutomationDetailsContainer))
);
