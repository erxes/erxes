import React from 'react';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { mutations } from '@erxes/ui-team/src/graphql';
import Form from '../../components/structure/Form';
import { IStructure } from '@erxes/ui-team/src/types';

type Props = {
  showView: () => void;
  refetch: () => Promise<any>;
  structure?: IStructure;
  closeModal?: () => void;
};

export default function FormContainer({ refetch, showView, structure, closeModal }: Props) {
  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
    callback
  }: IButtonMutateProps) => {
    const callbackResponse = () => {
      refetch().then(() => {
        showView();
      });

      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={
          object._id ? mutations.structuresEdit : mutations.structuresAdd
        }
        variables={values}
        isSubmitted={isSubmitted}
        type="submit"
        callback={callbackResponse}
        successMessage={`You successfully ${
          object._id ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  return (
    <Form
      structure={structure}
      showView={showView}
      renderButton={renderButton}
      closeModal={closeModal}
    />
  );
}
