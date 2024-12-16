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



  function buildCategoryTree(categories) {
    const categoryMap = new Map();
  
    // Initialize the map with all categories
    categories.forEach((category) => {
      categoryMap.set(category._id, { ...category, children: [] });
    });
  
    const tree:any = [];
  
    // Build the tree by assigning children to parents
    categories.forEach((category) => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(category._id));
        }
      } else {
        tree.push(categoryMap.get(category._id)); // Top-level categories
      }
    });
  
    return tree;
  }
  

  React.useEffect(() => {

  }, [clientPortalId]);

  const { data, loading, refetch } = useQuery(queries.GET_CATEGORIES, {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {}),
      clientPortalId,
    },
    fetchPolicy: 'network-only',
  });

  const [removeMutation] = useMutation(mutations.CATEGORY_REMOVE);

  if (loading) {
    return <Spinner />;
  }

  const remove = (id: string) => {
    const message = 'Are you sure want to remove this category ?';

    confirm(message).then(() => {
      removeMutation({
        variables: { _id: id },
      })
        .then(() => {
          refetch();
          Alert.success('You successfully deleted a category.');
        })
        .catch((e) => {
          Alert.error(e.message);
        });
    });
  };

  const totalCount = data?.insuranceCategoryList?.totalCount || 0;

  const categoryTree = buildCategoryTree(data?.cmsCategories || []);

  const extendedProps = {
    ...props,
    clientPortalId,
    loading,
    categoryTree,
    totalCount: data?.cmsCategories?.length || 0,
    refetch,
    remove,
  };

  return <List {...extendedProps} />;
}
