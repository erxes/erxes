import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import { IPost, RemoveMutationResponse } from '../../types';
import { mutations, queries } from '../../graphql';

import Bulk from '@erxes/ui/src/components/Bulk';
import PostsList from '../../components/posts/PostsList';
import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { useQuery } from 'react-apollo';
import { useSearchParam } from '../../hooks';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = Props & RemoveMutationResponse;

function List({ removeMutation, queryParams, history }: FinalProps) {
  const [categoryId] = useSearchParam('categoryId');
  const [state] = useSearchParam('state');
  const [categoryIncludeDescendants] = useSearchParam(
    'categoryIncludeDescendants'
  );

  const [categoryApprovalState] = useSearchParam('categoryApprovalState');

  const limit = Number(queryParams.perPage || 20);
  const pageIndex = Number(queryParams.page || 1);
  const offset = limit * (pageIndex - 1);

  const variables = {
    categoryId,
    state,
    categoryApprovalState,
    categoryIncludeDescendants: !!categoryIncludeDescendants,
    sort: { [queryParams.sortField]: queryParams.sortDirection },
    limit,
    offset
  };

  const totalPostsVariable = {
    categoryId,
    state,
    categoryApprovalState,
    categoryIncludeDescendants: !!categoryIncludeDescendants
  };

  const postQuery = useQuery(gql(queries.forumPostsQuery), {
    variables,
    fetchPolicy: 'network-only'
  });

  const totalPostQuery = useQuery(gql(queries.forumPostsQuery), {
    variables: totalPostsVariable,
    fetchPolicy: 'network-only'
  });

  if (postQuery.loading || totalPostQuery.loading) {
    return <Spinner objective={true} />;
  }
  if (postQuery.error) {
    Alert.error(postQuery.error.message);
  }

  const remove = (postId: string, emptyBulk?: () => void) => {
    const deleteFunction = (afterSuccess?: any) => {
      removeMutation({ variables: { _id: postId } })
        .then(() => {
          afterSuccess ? afterSuccess() : console.log('success');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    if (emptyBulk) {
      deleteFunction(emptyBulk);
    } else {
      confirm(`Are you sure?`)
        .then(() => {
          deleteFunction();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    }
  };

  const posts = postQuery.data.forumPosts || ([] as IPost[]);
  let filteredPosts;

  const totalCount = totalPostQuery.data.forumPosts.length || 0;

  if (queryParams.search) {
    filteredPosts = posts.filter(p => p.title.includes(queryParams.search));
  }

  const content = props => {
    return (
      <PostsList
        {...props}
        queryParams={queryParams}
        history={history}
        totalCount={totalCount}
        remove={remove}
        posts={queryParams.search ? filteredPosts : posts}
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
  )(List)
);
