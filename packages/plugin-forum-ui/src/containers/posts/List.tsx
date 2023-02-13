import * as compose from 'lodash.flowright';

import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import { IPost, RemoveMutationResponse } from '../../types';
import { mutations, queries } from '../../graphql';

import Bulk from '@erxes/ui/src/components/Bulk';
import PostsList from '../../components/posts/PostsList';
import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import queryString from 'query-string';
import { useQuery } from 'react-apollo';
import { useSearchParam } from '../../hooks';

type FinalProps = RemoveMutationResponse;

function List({ removeMutation }: FinalProps) {
  const [categoryId] = useSearchParam('categoryId');
  const [state] = useSearchParam('state');
  const [categoryIncludeDescendants] = useSearchParam(
    'categoryIncludeDescendants'
  );

  const queryParams = queryString.parse(location.search);

  const [categoryApprovalState] = useSearchParam('categoryApprovalState');
  const [strLimit] = useSearchParam('limit');
  const [strPageIndex, setPageIndex] = useSearchParam('pageIndex');

  const limit = Number(strLimit || 20);
  const pageIndex = Number(strPageIndex || 0);
  const offset = limit * pageIndex;

  const variables = {
    categoryId,
    state,
    categoryApprovalState,
    categoryIncludeDescendants: !!categoryIncludeDescendants,
    sort: { _id: -1, lastPublishedAt: -1 },
    limit,
    offset
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

  const remove = (pageId: string, emptyBulk: () => void) => {
    confirm(`Are you sure?`)
      .then(() => {
        removeMutation({ variables: { _id: pageId } })
          .then(() => {
            emptyBulk();
          })
          .catch(e => {
            Alert.error(e.message);
          });
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
        posts={postQuery.data.forumPosts || ([] as IPost[])}
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
