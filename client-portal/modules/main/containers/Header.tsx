import { gql, useMutation, useQuery } from '@apollo/client';
import React from 'react';
import { mutations } from '../../user/graphql';
import Header from '../components/Header';
import { Config, IUser } from '../../types';

type Props = {
  config: Config;
  currentUser: IUser;
  headerHtml?: string;
  headingSpacing?: boolean;
  headerBottomComponent?: React.ReactNode;
};

const noficationsCountQuery = gql`
  query clientPortalNotificationCounts {
    clientPortalNotificationCounts
  }
`;

const notificationsQuery = gql`
  query ClientPortalNotifications(
    $endDate: String
    $limit: Int
    $notifType: NotificationType
    $page: Int
    $perPage: Int
    $requireRead: Boolean
    $search: String
    $startDate: String
  ) {
    clientPortalNotifications(
      endDate: $endDate
      limit: $limit
      notifType: $notifType
      page: $page
      perPage: $perPage
      requireRead: $requireRead
      search: $search
      startDate: $startDate
    ) {
      _id
      content
      createdAt
      isRead
      link
      notifType
      title
    }
  }
`;

function HeaderContainer(props: Props) {
  const [logout, { data, error }] = useMutation(gql(mutations.logout));
  const notificationsCountResponse = useQuery(noficationsCountQuery, {
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
