import React from 'react';
import * as compose from 'lodash.flowright';
import { mutations, queries } from '../../graphql';
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

  const save = variables => {
    automationsAddNote({
      variables
    })
      .then(() => {
        Alert.success(`You successfully created a note`);

        props.closeModal();
      })

      .catch(error => {
        Alert.error(error.message);
      });
  };

  const edit = variables => {
    automationsEditNote({
      variables
    })
      .then(() => {
        Alert.success(`You successfully updated a ${variables.name || 'note'}`);
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
    graphql<Props, AddNoteMutationResponse, IAutomationNoteDoc>(
      gql(mutations.automationsAddNote),
      {
        name: 'automationsAddNote',
        options: ({ automationId }) => ({
          refetchQueries: [
            {
              query: gql(queries.automationNotes),
              variables: {
                automationId
              }
            }
          ]
        })
      }
    ),
    graphql<Props, EditNoteMutationResponse, IAutomationNoteDoc>(
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
