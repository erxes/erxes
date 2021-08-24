import React from 'react';
import * as compose from 'lodash.flowright';
import { mutations } from '../../graphql';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import NoteForm from 'modules/automations/components/forms/NoteForm';
import { IFormProps, IButtonMutateProps } from 'modules/common/types';
import { withProps, Alert, confirm } from 'modules/common/utils';
import {
  AddNoteMutationResponse,
  IAutomationNote,
  RemoveNoteMutationVariables,
  RemoveNoteMutationResponse
} from 'modules/automations/types';
import ButtonMutate from 'modules/common/components/ButtonMutate';

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
  RemoveNoteMutationResponse;

const NoteFormContainer = (props: FinalProps) => {
  const remove = (_id: string) => {
    confirm('Are you sure? This cannot be undone.').then(() => {
      props
        .automationsRemoveNote({
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

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      if (callback) {
        callback();
      }
    };

    console.log(values, isSubmitted, callback, object);

    if (object) {
      values._id = object._id;
    }

    return (
      <ButtonMutate
        mutation={
          object ? mutations.automationsEditNote : mutations.automationsAddNote
        }
        variables={values}
        callback={callBackResponse}
        refetchQueries={['automationNotes', 'automationDetail']}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a note`}
      />
    );
  };

  const extendedProps = {
    ...props,
    renderButton,
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
    )
  )(NoteFormContainer)
);
