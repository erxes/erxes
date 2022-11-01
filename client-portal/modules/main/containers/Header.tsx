import { gql, useMutation, useQuery } from '@apollo/client';
import React from 'react';
import { mutations } from '../../user/graphql';
import Header from '../components/Header';
import { Config, IUser, NotificationsCountQueryResponse, NotificationsQueryResponse } from '../../types';

type Props = {
  config: Config;
  currentUser: IUser;
  headerHtml?: string;
  headingSpacing?: boolean;
  headerBottomComponent?: React.ReactNode;
};

const notificationsCountQuery = gql`
  query clientPortalNotificationCounts {
    clientPortalNotificationCounts
  }
`;

function HeaderContainer(props: Props) {
  const [logout, { data, error }] = useMutation(gql(mutations.logout));
  const notificationsCountResponse = useQuery<NotificationsCountQueryResponse>(notificationsCountQuery, {
    skip: !props.currentUser,
  });


  if (error) {
    return <div>{error.message}</div>;
  }

  if (notificationsCountResponse.error) {
    return <div>{notificationsCountResponse.error.message}</div>;
  }

  const notificationsCount =
    (notificationsCountResponse.data &&
      notificationsCountResponse.data.clientPortalNotificationCounts) ||
    0;

  if (data) {
    window.location.href = '/';
  }

  const updatedProps = {
    ...props,
    notificationsCount,
    logout,
  };

  return <Header {...updatedProps} />;
}

export default HeaderContainer;
