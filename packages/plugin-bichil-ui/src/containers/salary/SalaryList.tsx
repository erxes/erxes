import { router } from '@erxes/ui/src';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IRouterProps } from '@erxes/ui/src/types';
import { Alert, confirm } from '@erxes/ui/src/utils';
import gql from 'graphql-tag';
import React from 'react';
import { useMutation, useQuery } from 'react-apollo';

import List from '../../components/salary/SalaryList';
import { mutations, queries } from '../../graphql';

type Props = {
  refetch?: () => void;
  history?: any;
  queryParams: any;
} & IRouterProps;

export default function ListContainer(props: Props) {
  const variables: any = {
    ...router.generatePaginationParams(props.queryParams || {})
  };

  const { data, loading, refetch } = useQuery(gql(queries.bichilSalaryReport), {
    variables: {
      ...variables
    },
    fetchPolicy: 'network-only'
  });

  const labelsQuery = useQuery(gql(queries.labelsQuery), {
    fetchPolicy: 'cache-first'
  });

  //   const { data, loading, refetch } = useQuery<ConfigsListQueryResponse>(
  //     gql(queries.listQuery),
  //     {
  //       variables: isSettings ? variables : {},
  //       fetchPolicy: 'network-only'
  //     }
  //   );

  //   const [removeMutation] = useMutation(gql(mutations.removeMutation));

  //   const remove = (_id: string) => {
  //     const message = 'Are you sure want to remove this config ?';

  //     confirm(message).then(() => {
  //       removeMutation({
  //         variables: { _id }
  //       })
  //         .then(() => {
  //           refetch();

  //           Alert.success('You successfully deleted a config.');
  //         })
  //         .catch(e => {
  //           Alert.error(e.message);
  //         });
  //     });
  //   };

  if (loading || labelsQuery.loading) {
    return <Spinner />;
  }

  //   const configs = (data && data.khanbankConfigsList.list) || [];

  //   const totalCount = (data && data.khanbankConfigsList.totalCount) || 0;

  const extendedProps = {
    ...props
    // loading,
    // configs,
    // totalCount,
    // refetch,
    // remove
  };

  return <List {...extendedProps} />;
}
