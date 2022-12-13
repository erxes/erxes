import { router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import { useMutation, useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import { BuildingListQueryResponse } from '../types';

type Props = {
  refetch: () => void;
  history: any;
  viewType: string;
  queryParams: any;
};

export default function BuildingContainer(props: Props) {
  const { data, loading, refetch } = useQuery<BuildingListQueryResponse>(
    gql(queries.listQuery),
    {
      variables: {
        ...router.generatePaginationParams(props.queryParams || {}),
        cityId: props.queryParams.city
      },
      fetchPolicy: 'network-only'
    }
  );

  const [removeMutation] = useMutation(gql(mutations.removeMutation));

  const remove = (buildingId: string) => {
    const message = 'Are you sure want to remove this building ?';

    confirm(message).then(() => {
      removeMutation({
        variables: { _id: buildingId }
      })
        .then(() => {
          refetch();

          Alert.success('You successfully deleted a building.');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const buildings = (data && data.buildingList.list) || [];

  const totalCount = (data && data.buildingList.totalCount) || 0;

  const extendedProps = {
    ...props,
    loading,
    buildings,
    totalCount,
    refetch,
    remove
  };

  return <List {...extendedProps} />;
}
