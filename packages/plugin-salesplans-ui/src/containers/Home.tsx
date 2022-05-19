import React from 'react';
import gql from 'graphql-tag';
import Home from '../components/Home';
import { useQuery, useMutation } from 'react-apollo';
import { queries, mutations } from '../graphql';

// type Props = {};

// class HomeContainer extends React.Component {
//   render() {
//     return <Home />;
//   }
// }

function HomeContainer() {
  const a = useQuery(gql(queries.getMiniPlanSalesLogs), {
    fetchPolicy: 'network-only'
  });

  return (
    <Home
      // listData={a.data ? a.data.getMiniPlanSalesLogs : []}
      listData={[]}
      refetch={a.refetch}
    />
  );
}
export default HomeContainer;
