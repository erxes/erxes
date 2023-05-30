import { router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import { gql, useQuery, useMutation, useLazyQuery } from '@apollo/client';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import {
  BuildingListQueryResponse,
  BuildingsByBoundsQueryResponse
} from '../types';
import { ICoordinates } from '../../../types';

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
      fetchPolicy: 'network-only',
      skip: props.viewType !== 'list'
    }
  );

  // const buildingsByBounds = useQuery<BuildingsByBoundsQueryResponse>(
  //   gql(queries.buildingsByBoundsQuery),
  //   {
  //     variables: {
  //       ...router.generatePaginationParams(props.queryParams || {}),
  //       cityId: props.queryParams.city
  //     },
  //     fetchPolicy: 'network-only',
  //     skip: props.viewType !== '3d'
  //   }
  // );

  const [
    fetchBuildingsWithinBounds,
    { data: buildingsByBoundsData }
  ] = useLazyQuery<BuildingsByBoundsQueryResponse>(
    gql(queries.buildingsByBoundsQuery)
  );

  const getBuildingsWithingBounds = (bounds: ICoordinates[]) => {
    fetchBuildingsWithinBounds({
      variables: {
        bounds: bounds.map(b => [b.lng, b.lat])
        // serviceStatuses: ['active', 'inprogress']
      }
    });
  };

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

  let buildings = (data && data.buildingList.list) || [];

  if (props.viewType === '3d') {
    buildings =
      (buildingsByBoundsData && buildingsByBoundsData.buildingsByBounds) || [];
  }

  const totalCount = (data && data.buildingList.totalCount) || 0;

  const extendedProps = {
    ...props,
    loading,
    buildings,
    totalCount,
    refetch,
    remove,
    getBuildingsWithingBounds
  };

  return <List {...extendedProps} />;
}
