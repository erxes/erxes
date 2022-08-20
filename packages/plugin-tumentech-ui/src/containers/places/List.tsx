import { router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import React from 'react';
import { useMutation, useQuery } from 'react-apollo';

import List from '../../components/places/List';
import { mutations, queries } from '../../graphql';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function PlaceContainer(props: Props) {
  const { data, loading, refetch } = useQuery(gql(queries.placesQuery), {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {})
    },
    fetchPolicy: 'network-only'
  });

  const [removeMutation] = useMutation(gql(mutations.removePlace));

  const remove = (placeId: string) => {
    const message = 'Are you sure want to remove this place ?';

    confirm(message).then(() => {
      removeMutation({
        variables: { _id: placeId }
      })
        .then(() => {
          refetch();

          Alert.success('You successfully deleted a place.');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const places = (data && data.places.list) || [];

  const totalCount = (data && data.places.totalCount) || 0;

  const extendedProps = {
    ...props,
    loading,
    places,
    totalCount,
    refetch,
    remove
  };

  return <List {...extendedProps} />;
}
