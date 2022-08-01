import { router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import React from 'react';
import { useMutation, useQuery } from 'react-apollo';

import List from '../../components/directions/List';
import { mutations, queries } from '../../graphql';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function ItemContainer(props: Props) {
  const { data, loading, refetch } = useQuery(gql(queries.directions), {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {})
    },
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

  const directions = (data && data.directions.list) || [];

  const totalCount = (data && data.directions.totalCount) || 0;

  const extendedProps = {
    ...props,
    loading,
    directions,
    totalCount,
    refetch,
    remove
  };

  return <List {...extendedProps} />;
}
