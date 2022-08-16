import React from 'react';
import { useSearchParam } from '../../hooks';
import { useQuery } from 'react-apollo';
import { FORUM_POSTS_QUERY } from '../../graphql/queries';

const List: React.FC = () => {
  const [categoryId] = useSearchParam('categoryId');
  const [state] = useSearchParam('state');
  const [categoryIncludeDescendants] = useSearchParam(
    'categoryIncludeDescendants'
  );

  const { data, loading, error } = useQuery(FORUM_POSTS_QUERY, {
    variables: {
      categoryId,
      state,
      categoryIncludeDescendants: !!categoryIncludeDescendants
    }
  });

  if (loading) return null;
  if (error) return <pre>{JSON.stringify(error, null, 2)}</pre>;

  // console.l

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
};

export default List;
