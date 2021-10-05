import gql from 'graphql-tag';
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
  AutomationsNoteQueryResponse
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

  const [saveLoading, setLoading] = useState(false);

  const save = (doc: IAutomation) => {
    setLoading(true);

    editAutomationMutation({
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
    save,
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
