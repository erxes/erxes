import React from 'react';
import gql from 'graphql-tag';
import Settings from '../components/Settings';
import { useQuery } from 'react-apollo';
import { queries } from '../graphql';

function SettingsContainer() {
  const a = useQuery(gql(queries.getSalesLogs), {
    fetchPolicy: 'network-only'
  });

  return (
    <Settings
      listData={a.data ? a.data.getSalesLogs : []}
      refetch={a.refetch}
    />
  );
}
export default SettingsContainer;
