import React from 'react';
import { useQuery } from 'react-apollo';
import { Link, useRouteMatch } from 'react-router-dom';
import { CATEGORIES_BY_PARENT_IDS } from '../graphql/queries';

export default function ForumCategory({ category }) {
  const { data, loading, error } = useQuery(CATEGORIES_BY_PARENT_IDS, {
    variables: { parentId: [category._id] }
  });

  if (loading) return null;

  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  const subCategories = data.forumCategories || [];

  const { path, url } = useRouteMatch();

  return (
    <div style={{ border: '1px solid #e0e0e0', padding: 10, margin: 10 }}>
      <Link to={`${url}/${category._id}`}>{category.name}</Link>

      <ul>
        {subCategories.map(c => (
          <li>
            <ForumCategory key={c._id} category={c} />
          </li>
        ))}
      </ul>
    </div>
  );
}
