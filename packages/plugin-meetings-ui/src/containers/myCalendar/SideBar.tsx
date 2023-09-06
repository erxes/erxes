import React from 'react';
import { IMeeting } from '../../types';
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

  const updatedProps = {
    ...props
  };
  return <SideBar {...updatedProps} />;
};

export default SideBarContainer;
