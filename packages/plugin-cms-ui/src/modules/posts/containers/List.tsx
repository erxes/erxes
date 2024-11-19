import { useMutation, useQuery } from '@apollo/client';
// import { router } from '@erxes/ui/src';

import { Alert, confirm, router } from '@erxes/ui/src/utils';
import React from 'react';
import { mutations, queries } from '../graphql';

import List from '../components/List';

type Props = {
  clientPortalId: string;
  refetch: () => void;
  queryParams: any;
};

export default function ListContainer(props: Props) {
  console.log('props', props);

  const {clientPortalId} = props

  const { data, loading, refetch } = useQuery(queries.POST_LIST, {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {}),
      clientPortalId
    },
    fetchPolicy: 'network-only',
  });

  const [removeMutation] = useMutation(mutations.CATEGORY_REMOVE);

  if (loading) {
    return <>loading</>
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
  console.log('posts', posts);

  const totalCount = data?.postList?.totalCount || 0;

  const extendedProps = {
    ...props,
    loading,
    posts,
    totalCount,
    refetch,
    remove,
  };

  console.log('extendedProps', extendedProps);

  return <List {...extendedProps} />;
}