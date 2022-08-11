import React from 'react';
import { useQuery } from 'react-apollo';
import { Link, useRouteMatch } from 'react-router-dom';
import { CATEGORIES_BY_PARENT_IDS } from '../graphql/queries';

export default function CategoryNavItem({ category }) {
  const { data, loading, error } = useQuery(CATEGORIES_BY_PARENT_IDS, {
    variables: { parentId: [category._id] }
  });
  const { path, url } = useRouteMatch();

  if (loading) return null;

  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  const subCategories = data.forumCategories || [];

  return (
    <div style={{ padding: 0, margin: 0 }}>
      <Link to={`./${category._id}`}>
        {category.thumbnail && (
          <img
            src={category.thumbnail}
            alt="category thumbnail"
            style={{ display: 'inline-block', width: 50, height: 50 }}
          />
        )}

        {category.name}
      </Link>

      <ol style={{ listStyle: 'none', padding: '0 0 0 3em', margin: 0 }}>
        {subCategories.map(c => (
          <li key={c._id} style={{ margin: '5px 0' }}>
            <CategoryNavItem category={c} />
          </li>
        ))}
      </ol>
    </div>
  );
}
