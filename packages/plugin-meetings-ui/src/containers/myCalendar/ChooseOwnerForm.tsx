import React from 'react';

import { mutations } from '../../graphql';
import ChooseOwnerForm from '../../components/myCalendar/ChooseOwnerForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ButtonMutate } from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  closeModal: () => void;
  pinnedUserIds: string[];
  currentUser: IUser;
};
export const ChooseOwnerFormContainer = (props: Props) => {
  const renderButton = ({
    passedName,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.updatePinnedUser}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } ${passedName}`}
        refetchQueries={['meetingPinnedUsers']}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };
  return <ChooseOwnerForm {...updatedProps} />;
};
