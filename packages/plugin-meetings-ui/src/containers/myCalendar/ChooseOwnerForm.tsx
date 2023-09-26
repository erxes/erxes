import React from 'react';

import { mutations } from '../../graphql';
import ChooseOwnerForm from '../../components/myCalendar/ChooseOwnerForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { ButtonMutate } from '@erxes/ui/src';

type Props = {
  closeModal: () => void;
  pinnedUserIds: string[];
};
export const ChooseOwnerFormContainer = (props: Props) => {
  const renderButton = ({
    passedName,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    object && object !== {} ? console.log(object, 'o') : console.log(';a');
    return (
      <ButtonMutate
        mutation={
          object && object !== {}
            ? mutations.editPinnedUser
            : mutations.addPinnedUser
        }
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
