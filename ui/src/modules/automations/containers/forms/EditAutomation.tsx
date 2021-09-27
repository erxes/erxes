import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { withProps, Alert } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import { useLocation, useHistory } from 'react-router-dom';
import { IUser } from '../../../auth/types';
import AutomationForm from '../../components/forms/AutomationForm';
import { queries, mutations } from '../../graphql';
import {
  DetailQueryResponse,
  EditMutationResponse,
  IAutomation,
  AutomationsNoteQueryResponse
} from '../../types';

type Props = {
  id: string;
  mainType: string;
};

type FinalProps = {
  automationDetailQuery: DetailQueryResponse;
  automationNotesQuery: AutomationsNoteQueryResponse;
  currentUser: IUser;
  saveAsTemplateMutation: any;
} & Props &
  EditMutationResponse;

const AutomationDetailsContainer = (props: FinalProps) => {
  const {
    automationDetailQuery,
    automationNotesQuery,
    currentUser,
    editAutomationMutation
  } = props;

  const location = useLocation();
  const history = useHistory();

  const save = (doc: IAutomation) => {
    const queryParams = new URLSearchParams(location.search);

    if (queryParams.has('isCreate')) {
      queryParams.delete('isCreate');

      history.replace({
        search: queryParams.toString()
      });
    }

    editAutomationMutation({
      variables: {
        ...doc
      }
    })
      .then(() => {
        Alert.success(`You successfully updated a ${doc.name || 'status'}`);

        history.push(`/automations/details/${props.id}`);
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

  const automationDetail = automationDetailQuery.automationDetail || {};
  const automationNotes = automationNotesQuery.automationNotes || [];

  const updatedProps = {
    ...props,
    loading: automationDetailQuery.loading,
    automation: automationDetail,
    automationNotes,
    currentUser,
    save
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
  )(AutomationDetailsContainer)
);
