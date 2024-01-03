import { router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import { CityListQueryResponse } from '../types';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function CityContainer(props: Props) {
  const { data, loading, refetch } = useQuery<CityListQueryResponse>(
    gql(queries.listQuery),
    {
      variables: {
        ...router.generatePaginationParams(props.queryParams || {})
      },
      fetchPolicy: 'network-only'
    }
  );

  const [removeMutation] = useMutation(gql(mutations.citiesRemoveMutation));

  const remove = (cityId: string) => {
    const message = 'Are you sure want to remove this city ?';

    confirm(message).then(() => {
      removeMutation({
        variables: { _id: cityId }
      })
        .then(() => {
          refetch();

          Alert.success('You successfully deleted a city.');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const cities = (data && data.cityList.list) || [];

  const totalCount = (data && data.cityList.totalCount) || 0;

  const extendedProps = {
    ...props,
    loading,
    cities,
    totalCount,
    refetch,
    remove
  };

  return <List {...extendedProps} />;
}
