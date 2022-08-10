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

  console.log(subCategories);

  return (
    <div style={{ border: '1px solid #e0e0e0', padding: 10, margin: 10 }}>
      <Link to={`${url}/${category._id}`}>
        {category.thumbnail && (
          <img
            src={category.thumbnail}
            alt="category thumbnail"
            style={{ display: 'inline-block', width: 50, height: 50 }}
          />
        )}

        {category.name}
      </Link>

      <ul>
        {subCategories.map(c => (
          <li key={c._id}>
            <CategoryNavItem category={c} />
          </li>
        ))}
      </ul>
    </div>
  );
}
