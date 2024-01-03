import { router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import { QuarterListQueryResponse } from '../types';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function QuarterContainer(props: Props) {
  const { data, loading, refetch } = useQuery<QuarterListQueryResponse>(
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

  const remove = (quarterId: string) => {
    const message = 'Are you sure want to remove this quarter ?';

    confirm(message).then(() => {
      removeMutation({
        variables: { _id: quarterId }
      })
        .then(() => {
          refetch();

          Alert.success('You successfully deleted a quarter.');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const quarters = (data && data.quarterList.list) || [];

  const totalCount = (data && data.quarterList.totalCount) || 0;

  const extendedProps = {
    ...props,
    loading,
    quarters,
    totalCount,
    refetch,
    remove
  };

  return <List {...extendedProps} />;
}
