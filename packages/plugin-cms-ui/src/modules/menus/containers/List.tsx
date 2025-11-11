import { useMutation, useQuery } from '@apollo/client';
import { router } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import List from '../components/List';
import { REMOVE_MENU } from '../graphql/mutations';
import { menuList } from '../graphql/queries';
import { IMenu } from '../types';
import { WEB_DETAIL } from '../../web/queries';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  queryParams: any;
};

const ListContainer: React.FC<Props> = (props) => {
  const { queryParams } = props;
  const { cpId = '' } = useParams<{ cpId: string }>();

  const { data: webData, loading: webLoading } = useQuery(WEB_DETAIL, {
    variables: {
      id: cpId,
    },
  });

  const { data, loading, refetch } = useQuery(menuList, {
    variables: {
      ...router.generatePaginationParams(queryParams || {}),
      clientPortalId: cpId,
    },
    fetchPolicy: 'network-only',
  });

  const [removeMutation] = useMutation(REMOVE_MENU, {
    refetchQueries: [{ query: menuList, variables: { clientPortalId: cpId } }],
  });

  const remove = (menuId: string) => {
    removeMutation({
      variables: { _id: menuId },
    }).catch((e) => {
      alert(e.message);
    });
  };

  if (loading || webLoading) {
    return <Spinner />;
  }

  const menus = (data && data.cmsMenuList) || [];
  const totalCount = (data && data.cmsMenuList.length) || 0;

  const updatedProps = {
    menus,
    totalCount,
    loading,
    remove,
    website: webData?.clientPortalGetConfig,
    clientPortalId: cpId,
    refetch,
    queryParams,
  };

  return <List {...updatedProps} />;
// return (<>hi</>)
};

export default ListContainer;
