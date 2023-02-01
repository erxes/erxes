import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import CategoriesList from '../../components/categories/CategoriesList';
import { queries } from '../../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert } from '@erxes/ui/src/utils';

export default function Categories() {
  const { data, loading, error } = useQuery(
    gql(queries.categoriesByParentIds),
    {
      variables: { parentId: [null] }
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
