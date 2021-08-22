import React from 'react';
import * as compose from 'lodash.flowright';
import { mutations } from '../../graphql';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import NoteForm from 'modules/automations/components/forms/NoteForm';
import { IFormProps, IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import {
  AddNoteMutationResponse,
  IAutomationNoteDoc,
  IAutomationNote
} from 'modules/automations/types';
import ButtonMutate from 'modules/common/components/ButtonMutate';

type Props = {
  formProps: IFormProps;
  notes?: IAutomationNote[];
  closeModal: () => void;
};

type FinalProps = {} & Props & AddNoteMutationResponse;

const NoteFormContainer = (props: FinalProps) => {
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
    console.log(values);

    // if (object) {
    //   variables._id = object._id;
    // }

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
    renderButton
  };

  return <NoteForm {...extendedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<{}, AddNoteMutationResponse, IAutomationNoteDoc>(
      gql(mutations.automationsAddNote),
      {
        name: 'addNoteAutomationMutation',
        options: () => ({
          refetchQueries: ['automationNotes', 'automationDetail']
        })
      }
    )
  )(NoteFormContainer)
);
