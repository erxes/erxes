import React from 'react';
import { IBranch, IDepartment } from '@erxes/ui/src/team/types';
import { IUser } from '@erxes/ui/src/auth/types';
import SideBar from '../../components/myMeetings/SideBar';

type Props = {
  history: any;
  currentUser: IUser;

  queryParams: any;
};

const SideBarContainer = (props: Props) => {
  const updatedProps = {
    ...props
  };

  return <SideBar {...updatedProps} />;
};

export default SideBarContainer;
