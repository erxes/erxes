import { ButtonMutate } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { ChangePassword } from '../components';
import { usersChangePassword } from '../graphql/mutations';

type Props = {
  closeModal: () => void;
};

const ChangePasswordContainer = (props: Props) => {
  const renderButton = ({
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={usersChangePassword}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={'Your password has been changed and updated'}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  return <ChangePassword {...updatedProps} />;
};

export default ChangePasswordContainer;
