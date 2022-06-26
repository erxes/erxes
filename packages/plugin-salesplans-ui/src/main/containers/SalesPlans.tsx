import React from 'react';
import { useQuery, useMutation } from 'react-apollo';
import { queries, mutations } from '../graphql';
import { Alert } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import SalesPlans from '../components/SalesPlans';

const SalesPlansContainer = () => {
  const [add] = useMutation(gql(mutations.salesLogAdd));
  const list = useQuery(gql(queries.getSalesLogs), {
    fetchPolicy: 'network-only'
  });

  const salesLogAdd = (doc: any) => {
    add({ variables: { ...doc } })
      .then(() => {
        Alert.success('Successfully saved!');
        list.refetch();
      })
      .catch((error: any) => {
        Alert.error(error.message);
      });
  };

  return (
    <SalesPlans
      listData={list.data ? list.data.getSalesLogs : []}
      refetch={list.refetch}
      addData={salesLogAdd}
    />
  );
};

export default SalesPlansContainer;
