import React from 'react';
import { IMeeting } from '../../types';
import SideBar from '../../components/myCalendar/SideBar';
import { gql, useQuery } from '@apollo/client';
import { queries as userQueries } from '@erxes/ui/src/team/graphql';
import { Spinner } from '@erxes/ui/src/components';
import { queries } from '../../graphql';

type Props = {
  history: any;
  currentTypeId?: string;
  queryParams: any;
  meetings: IMeeting[];
  loading: boolean;
};

const SideBarContainer = (props: Props) => {
  // calls gql mutation for edit/add type
  const { queryParams } = props;
  const { searchUserValue } = queryParams;
  const { data, loading } = useQuery(gql(userQueries.users), {
    variables: { perPage: 10, searchValue: searchUserValue }
  });
  const { data: pinnedUsers, loading: pinnedUserLoading } = useQuery(
    gql(queries.meetingPinnedUsers)
  );

  if (loading || pinnedUserLoading) {
    return <Spinner />;
  }

  const updatedProps = {
    ...props,
    participantUsers: data.users,
    pinnedUsers: pinnedUsers.meetingPinnedUsers || {
      pinnedUserIds: [],
      userId: '',
      pinnedUsersInfo: []
    }
  };
  return <SideBar {...updatedProps} />;
};

export default SideBarContainer;
