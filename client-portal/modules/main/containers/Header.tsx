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

function HeaderContainer(props: Props) {
  const [logout, { data, error }] = useMutation(gql(mutations.logout));
  const notificationsResponse = useQuery(noficationsCountQuery);

  if (error) {
    return <div>{error.message}</div>;
  }

  if (notificationsResponse.error) {
    return <div>{notificationsResponse.error.message}</div>;
  }

  const notificationsCount = notificationsResponse.data && notificationsResponse.data.clientPortalNotificationCounts || 0;

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
