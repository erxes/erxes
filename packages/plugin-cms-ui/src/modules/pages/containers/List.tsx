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

  const clientPortalId = searchParams.get('web') || '';
  

  const { data, loading, refetch } = useQuery(queries.PAGE_LIST, {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {}),
      clientPortalId,
    },
    fetchPolicy: 'network-only',
  });

  const [removeMutation] = useMutation(mutations.PAGE_REMOVE);

  // if (loading) {
  //   return <Spinner />;
  // }

  const remove = (id: string) => {
    const message = 'Are you sure want to remove this page ?';

    confirm(message).then(() => {
      removeMutation({
        variables: { id },
      })
        .then(() => {
          refetch();
          Alert.success('You successfully deleted a page.');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const totalCount = data?.cmsPageList?.totalCount || 0;

  const pages = data?.cmsPageList?.pages || [];

  const extendedProps = {
    ...props,
    clientPortalId,
    loading: false,
    pages,
    totalCount,
    refetch,
    remove,
  };

  return <List {...extendedProps} />;
}
