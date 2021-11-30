import React from 'react';
import { IButtonMutateProps } from 'modules/common/types';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { mutations } from '../../graphql';
import Form from '../../components/structure/Form';
import { IStructure } from '../../types';

type Props = {
  showView: () => void;
  refetch: () => Promise<any>;
  structure?: IStructure;
};

export default function FormContainer({ refetch, showView, structure }: Props) {
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
    />
  );
}
