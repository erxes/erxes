import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

import { queries } from '../graphql';
import Sidebar from '../components/Sidebar';

function SidebarContainer() {
  const { data, loading } = useQuery(gql(queries.exms));

  if (loading) {
    return <div>...</div>;
  }

  return <Sidebar list={data.exms.list || []} />;
}

export default SidebarContainer;
