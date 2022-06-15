import React from 'react';
import { useQuery, useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import List from '../../components/routes/List';
import { mutations, queries } from '../../graphql';
import { Alert, confirm } from '@erxes/ui/src/utils';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function RoutesContainer(props: Props) {
  const { data, loading, refetch } = useQuery(gql(queries.routesQuery), {
    fetchPolicy: 'network-only'
  });

  const [removeMutation] = useMutation(gql(mutations.removeRoute));

  const remove = (routeid: string) => {
    const message = 'Are you sure want to remove this route ?';

    confirm(message).then(() => {
      removeMutation({
        variables: { _id: routeid }
      })
        .then(() => {
          refetch();

          Alert.success('You successfully deleted a route.');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const routes = (data && data.routes) || [];

  const extendedProps = {
    ...props,
    loading,
    routes,
    totalCount: routes.length,
    refetch,
    remove
  };

  return <List {...extendedProps} />;
}
