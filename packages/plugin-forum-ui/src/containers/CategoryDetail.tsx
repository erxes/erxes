import React from 'react';
import { useParams } from 'react-router-dom';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

const CATEGORY = gql`
  query ForumCategory($id: ID!) {
    forumCategory(_id: $id) {
      _id
      code
      name
      parentId
    }
  }
`;

export default function CategoryDetail() {
  const { categoryId } = useParams();
  const { data, loading, error } = useQuery(CATEGORY, {
    variables: { id: categoryId }
  });

  if (loading) return null;
  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
