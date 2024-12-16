import { useMutation, useQuery } from '@apollo/client';
import { Spinner, router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import { mutations, queries } from '../graphql';

import List from '../components/List';
import { useSearchParams } from 'react-router-dom';

type Props = {
  queryParams: any;
};

export default function ListContainer(props: Props) {
  const [searchParams] = useSearchParams(); 

  const clientPortalId = searchParams.get('web') || '';

  React.useEffect(() => {}, [clientPortalId]);

  const { data, loading, refetch } = useQuery(queries.GET_TAGS, {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {}),
      clientPortalId,
    },
    fetchPolicy: 'network-only',
  });

  const [removeMutation] = useMutation(mutations.TAG_REMOVE);

  if (loading) {
    return <Spinner />;
  }

  const remove = (id: string) => {
    const message = 'Are you sure want to remove this tag ?';

    confirm(message).then(() => {
      removeMutation({
        variables: { _id: id },
      })
        .then(() => {
          refetch();
          Alert.success('You successfully deleted a tag.');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };


  const extendedProps = {
    ...props,
    clientPortalId,
    loading,
    tags: data?.cmsTags || [],
    totalCount: data?.cmsTags?.length || 0,
    refetch,
    remove,
  };

  return <List {...extendedProps} />;
}
