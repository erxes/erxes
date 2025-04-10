import { useMutation, useQuery } from '@apollo/client';
import { Spinner, router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import { mutations, queries } from '../graphql';

import List from '../components/List';
import { useParams, useSearchParams } from 'react-router-dom';
import { IWebSite } from '../../../types';
import { WEB_DETAIL } from '../../web/queries';

type Props = {
  refetch: () => void;
  queryParams: any;
};

export default function ListContainer(props: Props) {
  const { cpId = '' } = useParams<{ cpId: string }>();

  const { data: webData, loading: webLoading } = useQuery(WEB_DETAIL, {
    variables: {
      id: cpId,
    },
  });

  const { data, loading, refetch } = useQuery(queries.PAGE_LIST, {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {}),
      clientPortalId: cpId,
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
    website: webData?.clientPortalGetConfig,
    clientPortalId: cpId,
    loading: false,
    pages,
    totalCount,
    refetch,
    remove,
  };

  return <List {...extendedProps} />;
}
