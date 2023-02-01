import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import CategoriesList from '../../components/categories/CategoriesList';
import { queries } from '../../graphql';

export default function CategoriesNav() {
  const { data, loading, error } = useQuery(
    gql(queries.categoriesByParentIds),
    {
      variables: { parentId: [null] }
    }
  );

  if (loading) {
    return null;
  }

  if (error) {
    return <pre>{JSON.stringify(error, null, 2)}</pre>;
  }

  const forumCategories = data.forumCategories || [];

  return <CategoriesList forumCategories={forumCategories} />;
}
