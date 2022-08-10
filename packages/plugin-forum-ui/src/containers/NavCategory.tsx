import React from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom';

const CATEGORIES = gql`
  query ForumCategories($parentId: [ID]) {
    forumCategories(parentId: $parentId) {
      _id
      code
      name
    }
  }
`;

export default function ForumCategory({ category }) {
  const { data, loading, error } = useQuery(CATEGORIES, {
    variables: { parentId: [category._id] }
  });

  if (loading) return null;

  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  const subCategories = data.forumCategories || [];

  const { path, url } = useRouteMatch();

  console.log({ path, url });

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
