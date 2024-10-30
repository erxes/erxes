import { queries } from '@erxes/ui-notifications/src/graphql';
import { NotificationsQueryResponse } from '@erxes/ui-notifications/src/types';
import { gql, useQuery } from '@apollo/client';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import Component from '../components/NotificationCenter';

type Props = {
  queryParams: any;
};

const NotificationCenter = ({ queryParams }: Props) => {
  const { data, loading } = useQuery<NotificationsQueryResponse>(
    gql(queries.notifications)
  );

  if (loading) {
    return <Spinner />;
  }

  const notifications = data?.notifications || [];

  return <Component queryParams={queryParams} notifications={notifications} />;
};

export default NotificationCenter;
