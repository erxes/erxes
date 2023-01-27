import React from 'react';
import { useSearchParam } from '../../hooks';
import { useQuery } from 'react-apollo';
import { queries } from '../../graphql';
import gql from 'graphql-tag';
import { Link } from 'react-router-dom';
import { postUsername } from '../../utils';
import PostsList from '../../components/posts/PostsList';
import queryString from 'query-string';

const List: React.FC = () => {
  const [categoryId] = useSearchParam('categoryId');
  const [state] = useSearchParam('state');
  const [categoryIncludeDescendants] = useSearchParam(
    'categoryIncludeDescendants'
  );

  const queryParams = queryString.parse(location.search);

  const [categoryApprovalState] = useSearchParam('categoryApprovalState');

  const [perPage] = useSearchParam('perPage');
  const [page] = useSearchParam('page');

  const variables = {
    categoryId,
    state,
    categoryApprovalState,
    categoryIncludeDescendants: !!categoryIncludeDescendants,
    sort: { _id: -1 }
  };

  const postQuery = useQuery(gql(queries.forumPostsQuery), {
    variables,
    fetchPolicy: 'network-only'
  });

  const countQuery = useQuery(gql(queries.forumPostsCount), {
    variables,
    fetchPolicy: 'network-only'
  });

  if (postQuery.loading) {
    return null;
  }
  if (postQuery.error) {
    return <pre>{JSON.stringify(postQuery.error, null, 2)}</pre>;
  }
  return (
    <PostsList queryParams={queryParams} posts={postQuery.data.forumPosts} />
  );
};

export default List;
