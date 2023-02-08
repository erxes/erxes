import { Alert } from '@erxes/ui/src/utils';
import CategoriesList from '../../components/categories/CategoriesList';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { queries } from '../../graphql';
import { useQuery } from 'react-apollo';

export default function Categories() {
  const { data, loading, error } = useQuery(
    gql(queries.categoriesByParentIds),
    {
      variables: { parentId: [null] },
      fetchPolicy: 'network-only'
    }
  );

  if (loading) {
    return <Spinner objective={true} />;
  }

  if (error) {
    Alert.error(error.message);
  }

  const forumCategories = data.forumCategories || [];

  return <CategoriesList forumCategories={forumCategories} />;
}
