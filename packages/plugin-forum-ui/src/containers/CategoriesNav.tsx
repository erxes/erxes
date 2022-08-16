import React from 'react';
import { useQuery } from 'react-apollo';
import CategoryNavItem from './CategoryNavItem';
import { CATEGORIES_BY_PARENT_IDS } from '../graphql/queries';
import { Link, useRouteMatch } from 'react-router-dom';

export default function CategoriesNav() {
  const { data, loading, error } = useQuery(CATEGORIES_BY_PARENT_IDS, {
    variables: { parentId: [null] }
  });

  if (loading) return null;

  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  const forumCategories = data.forumCategories || [];

  return (
    <nav style={{ padding: '1em 2em' }}>
      <ol style={{ listStyle: 'none' }}>
        <li key="categorynew" style={{ margin: '5px 0' }}>
          <Link to={`/forums/categories/new`}>Create new root category</Link>
        </li>
        {forumCategories.map(category => (
          <li key={category._id} style={{ margin: '5px 0' }}>
            <CategoryNavItem category={category} />
          </li>
        ))}
      </ol>
    </nav>
  );
}
