import { useLocation, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { router } from '@erxes/ui/src/utils';
import { IMenu } from '../types';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { menuList } from '../graphql/queries';
import { removeMenu } from '../graphql/mutations';
import { useMutation } from '@apollo/client';
import List from '../components/List';

type Props = {
  queryParams: any;
};

const ListContainer: React.FC<Props> = (props) => {
  const { queryParams } = props;
  const [bulk, setBulk] = useState<IMenu[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { data, loading, refetch } = useQuery(gql(menuList), {
    variables: {
      ...router.generatePaginationParams(queryParams || {}),
      searchValue: queryParams.searchValue,
    },
    fetchPolicy: 'network-only',
  });

  const [removeMutation] = useMutation(gql(removeMenu), {
    refetchQueries: [{ query: gql(menuList) }],
  });

  const remove = (menuId: string) => {
    removeMutation({
      variables: { _id: menuId },
    }).catch((e) => {
      alert(e.message);
    });
  };

  const toggleBulk = (menu: IMenu, isChecked?: boolean) => {
    let updatedBulk = [...bulk];

    if (isChecked === undefined) {
      if (bulk.find((item) => item._id === menu._id)) {
        updatedBulk = updatedBulk.filter((item) => item._id !== menu._id);
      } else {
        updatedBulk.push(menu);
      }
    } else {
      if (isChecked) {
        if (!updatedBulk.find((item) => item._id === menu._id)) {
          updatedBulk.push(menu);
        }
      } else {
        updatedBulk = updatedBulk.filter((item) => item._id !== menu._id);
      }
    }

    setBulk(updatedBulk);
    setIsAllSelected(false);
  };

  const toggleAll = (menus: IMenu[], isChecked: boolean) => {
    if (isChecked) {
      setBulk(menus);
    } else {
      setBulk([]);
    }
    setIsAllSelected(isChecked);
  };

  const search = (searchValue: string) => {
    router.setParams(navigate, location, { searchValue });
  };

  const menus = (data && data.cmsMenuList) || [];
  const totalCount = (data && data.cmsMenuList.length) || 0;

  const updatedProps = {
    menus,
    totalCount,
    loading,
    remove,
    toggleBulk,
    toggleAll,
    isAllSelected,
    history: { ...location, push: navigate },
    queryParams,
  };

  return <List {...updatedProps} />;
};

export default ListContainer;
