import { Alert, confirm } from '@erxes/ui/src/utils';
import { gql, useMutation, useQuery } from '@apollo/client';
import { mutations, queries } from '../graphql';

import History from '../components/History';
import React from 'react';
import DashboardComponent from '../components/Dashboard';



const DashboardContainer = (props) => {
  let histories;
  const { data, loading, error, refetch } = useQuery(
    gql(queries.callHistories),
    {
      fetchPolicy: 'network-only',
    },
  );
 

  if (error) {
    Alert.error(error.message);
  }

  histories = data?.callHistories;

  return (
   <h1>a</h1>
  );
};

export default DashboardContainer;
