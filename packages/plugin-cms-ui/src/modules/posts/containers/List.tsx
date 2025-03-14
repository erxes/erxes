import { useMutation, useQuery } from '@apollo/client';
// import { router } from '@erxes/ui/src';

import { Alert, confirm, router } from '@erxes/ui/src/utils';
import React from 'react';
import { mutations, queries } from '../graphql';

import Spinner from '@erxes/ui/src/components/Spinner';
import { useLocation, useParams } from 'react-router-dom';
import List from '../components/List';
import { WEB_DETAIL } from '../../web/queries';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function ListContainer(props: Props) {
  const { cpId = '' } = useParams<{ cpId: string }>();
  const location = useLocation();

  const { data: webData, loading: webLoading } = useQuery(WEB_DETAIL, {
    variables: {
      id: cpId,
    },
  });

  const { data, loading, refetch } = useQuery(queries.POST_LIST, {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {}),
      clientPortalId: cpId,
    },
    fetchPolicy: 'network-only',
  });

  const [removeMutation] = useMutation(mutations.POST_REMOVE);

  if (loading) {
    return <Spinner />;
  }

  const remove = (id: string) => {
    const message = 'Are you sure want to remove this post ?';

    confirm(message).then(() => {
      removeMutation({
        variables: { id },
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

  const posts = data?.cmsPostList?.posts || [];

  const totalCount = data?.cmsPostList?.totalCount || 0;

  const extendedProps = {
    ...props,
    website: webData?.clientPortalGetConfig,
    clientPortalId: cpId,
    loading,
    posts,
    totalCount,
    refetch,
    remove,
  };

  return <List {...extendedProps} />;
}
