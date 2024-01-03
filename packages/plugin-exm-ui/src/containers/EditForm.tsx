import React from 'react';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client';

import { Alert } from '@erxes/ui/src/utils';

import EditForm from '../components/EditForm';
import { mutations } from '../graphql';
import { IExm } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';

type Props = {
  exm: IExm;
};

function EditFormContainer(props: Props) {
  const [editMutation] = useMutation(gql(mutations.exmsEdit));

  const edit = (variables: IExm) => {
    editMutation({ variables })
      .then(() => {
        Alert.success('Successfully edited');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const renderButton = ({
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.exmsEdit}
        variables={values}
        callback={callback}
        refetchQueries={'exmGet'}
        isSubmitted={isSubmitted}
        type="submit"
        icon="check-circle"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a exm`}
      />
    );
  };

  return <EditForm edit={edit} exm={props.exm} renderButton={renderButton} />;
}

export default EditFormContainer;
