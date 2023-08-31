import React from 'react';
import { IMeeting } from '../../types';
import { mutations } from '../../graphql';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import SideBar from '../../components/myCalendar/SideBar';

type Props = {
  history: any;
  currentTypeId?: string;
  queryParams: any;
  meetings: IMeeting[];
  loading: boolean;
};

const SideBarContainer = (props: Props) => {
  // calls gql mutation for edit/add type
  const renderButton = ({
    passedName,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.editMeeting : mutations.addMeeting}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${passedName}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  return <SideBar {...updatedProps} />;
};

export default SideBarContainer;
