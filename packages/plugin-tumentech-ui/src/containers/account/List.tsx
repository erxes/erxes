import { router } from '@erxes/ui/src';
import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';

import List from '../../components/account/List';
import { queries } from '../../graphql';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function AccountsContainer(props: Props) {
  const { data, loading, refetch } = useQuery(gql(queries.accountsQuery), {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {})
    },
    fetchPolicy: 'network-only'
  });

  // const [removeMutation] = useMutation(gql(mutations.removeDirection));

  // const remove = (directionId: string) => {
  //   const message = 'Are you sure?';

  //   confirm(message).then(() => {
  //     removeMutation({
  //       variables: { _id: directionId }
  //     })
  //       .then(() => {
  //         refetch();

  //         Alert.success('You successfully deleted a direction.');
  //       })
  //       .catch(e => {
  //         Alert.error(e.message);
  //       });
  //   });
  // };

  const accounts = (data && data.customerAccountsList.list) || [];

  const totalCount = (data && data.customerAccountsList.totalCount) || 0;

  const extendedProps = {
    ...props,
    loading,
    accounts,
    totalCount,
    refetch
    // remove
  };

  return <List {...extendedProps} />;
}
