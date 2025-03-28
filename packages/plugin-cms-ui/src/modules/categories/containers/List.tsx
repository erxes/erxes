import { useMutation, useQuery } from '@apollo/client';
import { Spinner, router } from '@erxes/ui/src';
import { Alert, confirm } from '@erxes/ui/src/utils';
import React from 'react';
import { mutations, queries } from '../graphql';

import List from '../components/List';
import { useParams } from 'react-router-dom';
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
  
  const { data, loading, refetch } = useQuery(queries.GET_CATEGORIES, {
    variables: {
      ...router.generatePaginationParams(props.queryParams || {}),
      clientPortalId: cpId,
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
        variables: { id },
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

  const categoryTree = buildCategoryTree(data?.cmsCategories || []);

  const extendedProps = {
    ...props,
    website: webData?.clientPortalGetConfig,
    clientPortalId: cpId,
    loading,
    categoryTree,
    totalCount: data?.cmsCategories?.length || 0,
    refetch,
    remove,
  };

  return <List {...extendedProps} />;
}
