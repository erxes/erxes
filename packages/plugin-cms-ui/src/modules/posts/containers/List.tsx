import { useMutation, useQuery } from '@apollo/client';
import { Spinner, router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import { mutations, queries } from '../graphql';

import List from '../components/List';
import { useSearchParams } from 'react-router-dom';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function ListContainer(props: Props) {
  const [searchParams] = useSearchParams();
  const clientPortalId = searchParams.get('cpid');

  const { data, loading, refetch } = useQuery(queries.POST_LIST, {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {}),
      clientPortalId
    },
    fetchPolicy: 'network-only',
  });

  const [removeMutation] = useMutation(mutations.CATEGORY_REMOVE);

  if (loading) {
    return <Spinner />;
  }

  const remove = (id: string) => {
    const message = 'Are you sure want to remove this post ?';

    confirm(message).then(() => {
      removeMutation({
        variables: { _id: id },
      })
        .then(() => {
          refetch();
          Alert.success('You successfully deleted a post.');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const posts = data?.postList?.posts || [];

  const totalCount = data?.postList?.totalCount || 0;

  const extendedProps = {
    ...props,
    loading,
    posts,
    totalCount,
    refetch,
    remove,
  };

  return <List {...extendedProps} />;
}
