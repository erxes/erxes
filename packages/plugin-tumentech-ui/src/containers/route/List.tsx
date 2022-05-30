import React from 'react';
import { useQuery, useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import List from '../../components/route/List';
// import Spinner from '@erxes/ui/src/components/Spinner';
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

  const [removeMutation] = useMutation(gql(mutations.removeDirection));

  const remove = (directionId: string) => {
    const message = 'Are you sure?';

    confirm(message).then(() => {
      removeMutation({
        variables: { _id: directionId }
      })
        .then(() => {
          refetch();

          Alert.success('You successfully deleted a direction.');
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
