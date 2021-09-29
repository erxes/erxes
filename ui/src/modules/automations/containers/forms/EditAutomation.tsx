import gql from 'graphql-tag';
import client from 'apolloClient';
import * as compose from 'lodash.flowright';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { router, withProps, Alert } from 'modules/common/utils';
import React, { useState } from 'react';
import { graphql } from 'react-apollo';
import { IUser } from '../../../auth/types';
import AutomationForm from '../../components/forms/AutomationForm';
import { queries, mutations } from '../../graphql';
import {
  DetailQueryResponse,
  EditMutationResponse,
  IAutomation,
  AutomationsNoteQueryResponse,
  ITrigger,
  IAction
} from '../../types';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from 'modules/common/types';

type Props = {
  id: string;
  queryParams: any;
};

type FinalProps = {
  automationDetailQuery: DetailQueryResponse;
  automationNotesQuery: AutomationsNoteQueryResponse;
  currentUser: IUser;
  saveAsTemplateMutation: any;
} & Props &
  EditMutationResponse &
  IRouterProps;

const AutomationDetailsContainer = (props: FinalProps) => {
  const {
    automationDetailQuery,
    automationNotesQuery,
    currentUser,
    history,
    editAutomationMutation
  } = props;

  const [count, setCount] = useState(0);

  const previewCount = (item: ITrigger | IAction) => {
    const config = item.config;

    client
      .query({
        query: gql(queries.automationConfigPrievewCount),
        variables: {
          config
        }
      })
      .then(({ data }) => {
        setCount(data.automationConfigPrievewCount);
      });
  };

  const save = (doc: IAutomation) => {
    editAutomationMutation({
      variables: {
        ...doc
      }
    })
      .then(() => {
        router.removeParams(history, 'isCreate');

        Alert.success(`You successfully updated a ${doc.name || 'status'}`);
      })

      .catch(error => {
        Alert.error(error.message);
      });
  };

  if (automationDetailQuery.loading || automationNotesQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!automationDetailQuery.automationDetail) {
    return (
      <EmptyState text="Automation not found" image="/images/actions/24.svg" />
    );
  }

  const automationDetail = automationDetailQuery.automationDetail;
  const automationNotes = automationNotesQuery.automationNotes || [];

  const updatedProps = {
    ...props,
    loading: automationDetailQuery.loading,
    automation: automationDetail,
    automationNotes,
    currentUser,
    previewCount,
    save,
    count
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
    graphql<{}, EditMutationResponse, IAutomation>(
      gql(mutations.automationsEdit),
      {
        name: 'editAutomationMutation',
        options: () => ({
          refetchQueries: ['automations', 'automationsMain', 'automationDetail']
        })
      }
    )
  )(withRouter<FinalProps>(AutomationDetailsContainer))
);
