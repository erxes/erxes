import React from 'react';
import * as compose from 'lodash.flowright';
import { mutations } from '../../graphql';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import NoteForm from 'modules/automations/components/forms/NoteForm';
import { IFormProps } from 'modules/common/types';
import { withProps, Alert, confirm } from 'modules/common/utils';
import {
  AddNoteMutationResponse,
  IAutomationNote,
  RemoveNoteMutationVariables,
  RemoveNoteMutationResponse,
  EditNoteMutationResponse,
  IAutomationNoteDoc
} from 'modules/automations/types';

type Props = {
  formProps: IFormProps;
  automationId: string;
  itemId: string;
  isEdit?: boolean;
  notes?: IAutomationNote[];
  closeModal: () => void;
};

type FinalProps = {} & Props &
  AddNoteMutationResponse &
  EditNoteMutationResponse &
  RemoveNoteMutationResponse;

const NoteFormContainer = (props: FinalProps) => {
  const {
    automationsRemoveNote,
    automationsEditNote,
    automationsAddNote
  } = props;

  const remove = (_id: string) => {
    confirm('Are you sure? This cannot be undone.').then(() => {
      automationsRemoveNote({
        variables: { _id }
      })
        .then(() => {
          Alert.success('You successfully deleted a note.');
        })
        .catch(error => {
          Alert.error(error.message);
        });
    });
  };

  const save = doc => {
    automationsAddNote({
      variables: {
        ...doc
      }
    })
      .then(data => {
        Alert.success(`You successfully created a note`);
        props.closeModal();
      })

      .catch(error => {
        Alert.error(error.message);
      });
  };

  const edit = doc => {
    automationsEditNote({
      variables: {
        ...doc
      }
    })
      .then(() => {
        Alert.success(`You successfully updated a ${doc.name || 'note'}`);
        props.closeModal();
      })

      .catch(error => {
        Alert.error(error.message);
      });
  };

  const extendedProps = {
    ...props,
    save,
    edit,
    remove
  };

  return <NoteForm {...extendedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, RemoveNoteMutationResponse, RemoveNoteMutationVariables>(
      gql(mutations.automationsRemoveNote),
      {
        name: 'automationsRemoveNote',
        options: {
          refetchQueries: ['automationNotes']
        }
      }
    ),
    graphql<{}, AddNoteMutationResponse, IAutomationNoteDoc>(
      gql(mutations.automationsAddNote),
      {
        name: 'automationsAddNote',
        options: () => ({
          refetchQueries: ['automationNotes']
        })
      }
    ),
    graphql<{}, EditNoteMutationResponse, IAutomationNoteDoc>(
      gql(mutations.automationsEditNote),
      {
        name: 'automationsEditNote',
        options: () => ({
          refetchQueries: ['automationNotes']
        })
      }
    )
  )(NoteFormContainer)
);
