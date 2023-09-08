import React from 'react';
import { IMeeting } from '../../types';
import SideBar from '../../components/myCalendar/SideBar';
import { IUser } from '@erxes/ui/src/auth/types';

type Props = {
  history: any;
  currentTypeId?: string;
  queryParams: any;
  meetings: IMeeting[];
  loading: boolean;
  participantUsers: IUser[];
};

const SideBarContainer = (props: Props) => {
  // calls gql mutation for edit/add type

  const updatedProps = {
    ...props
  };
  return <SideBar {...updatedProps} />;
};

export default SideBarContainer;
