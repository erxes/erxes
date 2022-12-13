import { router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import { useMutation, useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import { DistrictsListQueryResponse } from '../types';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function DistrictContainer(props: Props) {
  const { data, loading, refetch } = useQuery<DistrictsListQueryResponse>(
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

  const remove = (districtId: string) => {
    const message = 'Are you sure want to remove this district ?';

    confirm(message).then(() => {
      removeMutation({
        variables: { _id: districtId }
      })
        .then(() => {
          refetch();

          Alert.success('You successfully deleted a district.');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const districts = (data && data.districtList.list) || [];

  const totalCount = (data && data.districtList.totalCount) || 0;

  const extendedProps = {
    ...props,
    loading,
    districts,
    totalCount,
    refetch,
    remove
  };

  return <List {...extendedProps} />;
}
