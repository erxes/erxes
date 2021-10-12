import React from 'react';
import gql from 'graphql-tag';
import { IButtonMutateProps } from 'erxes-ui/lib/types';
import { ButtonMutate } from 'erxes-ui';

import { mutations, queries } from '../graphql';
import ThankForm from '../components/ThankForm';

type Props = {
  item?: any;
  closeModal?: () => void;
  queryParams?: any;
};

export default function ThankFormContainer(props: Props) {
  const { item } = props;

  const renderButton = ({
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      if (callback) {
        callback();
      }
    };

    const variables = {
      ...values
    };

    if (item) {
      variables._id = item._id;
    }

    return (
      <ButtonMutate
        mutation={variables._id ? mutations.editThank : mutations.addThank}
        variables={variables}
        callback={callBackResponse}
        isSubmitted={isSubmitted}
        successMessage={`You successfully ${
          variables._id ? 'edited' : 'added'
        } a thank you`}
        type='submit'
        icon='check-circle'
      />
    );
  };

  return <ThankForm {...props} renderButton={renderButton} />;
}
