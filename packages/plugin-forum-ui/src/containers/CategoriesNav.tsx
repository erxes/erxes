import React from 'react';
import { useQuery } from 'react-apollo';
import CategoryNavItem from './CategoryNavItem';
import { CATEGORIES_BY_PARENT_IDS } from '../graphql/queries';

export default function CategoriesNav() {
  const { data, loading, error } = useQuery(CATEGORIES_BY_PARENT_IDS, {
    variables: { parentId: [null] }
  });

  if (loading) return null;

  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  const forumCategories = data.forumCategories || [];

  return (
    <nav>
      <ul>
        {forumCategories.map(category => (
          <li>
            <CategoryNavItem key={category._id} category={category} />
          </li>
        ))}
      </ul>
    </nav>
  );
}
