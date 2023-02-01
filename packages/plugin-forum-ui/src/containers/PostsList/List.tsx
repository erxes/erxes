import React from 'react';
import { useSearchParam } from '../../hooks';
import { useQuery } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import gql from 'graphql-tag';
import PostsList from '../../components/posts/PostsList';
import queryString from 'query-string';
import Bulk from '@erxes/ui/src/components/Bulk';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { RemoveMutationResponse, PostsQueryResponse } from '../../types';
import { graphql } from 'react-apollo';

type FinalProps = {
  postsQuery: PostsQueryResponse;
} & RemoveMutationResponse &
  IRouterProps;

function List({ removeMutation, postsQuery }: FinalProps) {
  const [categoryId] = useSearchParam('categoryId');
  const [state] = useSearchParam('state');
  const [categoryIncludeDescendants] = useSearchParam(
    'categoryIncludeDescendants'
  );

  const queryParams = queryString.parse(location.search);

  const [categoryApprovalState] = useSearchParam('categoryApprovalState');

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

  if (postQuery.loading) {
    return null;
  }
  if (postQuery.error) {
    return <pre>{JSON.stringify(postQuery.error, null, 2)}</pre>;
  }

  const remove = (pageId, emptyBulk) => {
    removeMutation({ variables: { _id: pageId } })
      .then(() => {
        postsQuery.refetch();
        emptyBulk();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const content = props => {
    return (
      <PostsList
        {...props}
        queryParams={queryParams}
        remove={remove}
        posts={postQuery.data.forumPosts}
      />
    );
  };

  return <Bulk content={content} />;
}

export default withProps<{}>(
  compose(
    graphql<RemoveMutationResponse, { _id: string }>(
      gql(mutations.deletePost),
      {
        name: 'removeMutation',
        options: () => ({
          refetchQueries: queries.postRefetchAfterCreateDelete
        })
      }
    )
  )(withRouter<FinalProps>(List))
);
