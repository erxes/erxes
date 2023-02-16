import React from 'react';
import { useQuery } from 'react-apollo';
import { queries } from '../../graphql';
import gql from 'graphql-tag';
import CategoryFilter from '../../components/posts/CategoriesFilter';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert } from '@erxes/ui/src/utils';

export default function CategoriesFilter() {
  const { data, loading, error } = useQuery(gql(queries.categoriesAll));

  if (loading) {
    return <Spinner objective={true} />;
  }

  if (error) {
    Alert.error(error.message);
  }

  const forumCategories = data.forumCategories || [];

  return <CategoryFilter categories={forumCategories} />;
}
