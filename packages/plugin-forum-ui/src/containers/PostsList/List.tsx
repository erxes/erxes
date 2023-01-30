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
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import { RemoveMutationResponse, PostsQueryResponse } from '../../types';
import { graphql } from 'react-apollo';

type FinalProps = {
  postsQuery: PostsQueryResponse;
} & RemoveMutationResponse &
  IRouterProps;

function List({ history, removeMutation, postsQuery }: FinalProps) {
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

  const remove = pageId => {
    confirm(`This action will remove the post. Are you sure?`)
      .then(() => {
        removeMutation({ variables: { _id: pageId } })
          .then(() => {
            Alert.success('You successfully deleted a post');
            postsQuery.refetch();
          })
          .catch(e => {
            Alert.error(e.message);
          });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const renderButton = ({
    passedName: name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.editPost : mutations.createPost}
        variables={values}
        callback={callback}
        refetchQueries={getRefetchQueries()}
        type="submit"
        isSubmitted={isSubmitted}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } an ${name}`}
      />
    );
  };

  const content = props => {
    return (
      <PostsList
        {...props}
        queryParams={queryParams}
        renderButton={renderButton}
        remove={remove}
        posts={postQuery.data.forumPosts}
      />
    );
  };
  return <Bulk content={content} />;
}

const getRefetchQueries = () => {
  return [
    {
      query: gql(queries.forumPostsQuery)
    }
  ];
};

export default withProps<{}>(
  compose(
    graphql<PostsQueryResponse>(gql(queries.forumPostsQuery), {
      name: 'postsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
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
