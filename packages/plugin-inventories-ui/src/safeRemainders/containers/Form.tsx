import React from 'react';
import { useHistory } from 'react-router-dom';
import * as compose from 'lodash.flowright';
// erxes
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
// local
import FormComponent from '../components/Form';
import { mutations } from '../graphql';

type Props = {
  closeModal: () => void;
};

function FormContainer(props: Props) {
  const history = useHistory();

  const getRefetchQueries = () => {
    return ['safeRemainders'];
  };

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    const _callback = (data: any) => {
      if (callback) {
        callback(data);
      }

      history.push(
        `/inventories/safe-remainders/details/${data.safeRemainderAdd._id}`
      );
    };

    return (
      <ButtonMutate
        mutation={mutations.safeRemainderAdd}
        variables={values}
        callback={_callback}
        refetchQueries={getRefetchQueries()}
        isSubmitted={isSubmitted}
        type="submit"
        uppercase={false}
        successMessage={`You successfully added a ${name}`}
      />
    );
  };

  const componentProps = {
    ...props,
    renderButton
  };

  return <FormComponent {...componentProps} />;
}

export default compose()(FormContainer);
