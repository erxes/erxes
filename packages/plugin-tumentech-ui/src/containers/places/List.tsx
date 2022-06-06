import React from 'react';
import { useQuery, useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import List from '../../components/places/List';
import { mutations, queries } from '../../graphql';
import { Alert, confirm } from '@erxes/ui/src/utils';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function PlaceContainer(props: Props) {
  const { data, loading, refetch } = useQuery(gql(queries.placesQuery), {
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

  const places = (data && data.places) || [];

  const extendedProps = {
    ...props,
    loading,
    places,
    totalCount: places.length,
    refetch,
    remove
  };

  return <List {...extendedProps} />;
}
