import { router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import React from 'react';
import { useMutation, useQuery } from 'react-apollo';

import List from '../../components/routes/List';
import { mutations, queries } from '../../graphql';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function RoutesContainer(props: Props) {
  const { data, loading, refetch } = useQuery(gql(queries.routesQuery), {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {})
    },
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

  const routes = (data && data.routes.list) || [];

  const totalCount = (data && data.routes.totalCount) || 0;

  const extendedProps = {
    ...props,
    loading,
    routes,
    totalCount,
    refetch,
    remove
  };

  return <List {...extendedProps} />;
}
