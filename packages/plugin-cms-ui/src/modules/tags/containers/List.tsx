import { useMutation, useQuery } from '@apollo/client';
import { Spinner, router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import { mutations, queries } from '../graphql';

import List from '../components/List';
import { useParams, useSearchParams } from 'react-router-dom';
import { WEB_DETAIL } from '../../web/queries';

type Props = {
  queryParams: any;
};

export default function ListContainer(props: Props) {
    const { cpId = '' } = useParams<{ cpId: string }>();
  
    const { data: webData, loading: webLoading } = useQuery(WEB_DETAIL, {
      variables: {
        id: cpId,
      },
    });


  const { data, loading, refetch } = useQuery(queries.GET_TAGS, {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {}),
      clientPortalId:cpId
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
        variables: { id },
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
    website: webData?.clientPortalGetConfig,
    clientPortalId: cpId,
    loading,
    tags: data?.cmsTags || [],
    totalCount: data?.cmsTags?.length || 0,
    refetch,
    remove,
  };

  return <List {...extendedProps} />;
}
