import React from 'react';
import { useMutation } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import gql from 'graphql-tag';
import { PostDetailQueryResponse } from '../../types';
import { withProps, confirm } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import Detail from '../../components/posts/PostDetail';

type Props = {
  _id: string;
};

type FinalProps = {
  postDetailQuery: PostDetailQueryResponse;
} & Props;

function PostDetail(props: FinalProps) {
  const { postDetailQuery, _id } = props;

  const [mutDraft] = useMutation(gql(mutations.postDraft), {
    variables: { _id },
    refetchQueries: queries.postRefetchAfterEdit
  });

  const [mutPublish] = useMutation(gql(mutations.postPublish), {
    variables: { _id },
    refetchQueries: queries.postRefetchAfterEdit
  });

  const [mutApprove] = useMutation(gql(mutations.postApprove), {
    variables: { _id },
    refetchQueries: queries.postRefetchAfterEdit
  });

  const [mutDeny] = useMutation(gql(mutations.postDeny), {
    variables: { _id },
    refetchQueries: queries.postRefetchAfterEdit
  });

  if (postDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!postDetailQuery.forumPost) {
    return <EmptyState text="Post not found" image="/images/actions/17.svg" />;
  }

  const onDraft = async () => {
    confirm('Are you sure you want to save as draft').then(() => mutDraft());
  };

  const onPublish = async () => {
    confirm('Are you sure you want to publish?').then(() => mutPublish());
  };

  const onApproveClick = async () => {
    confirm('Are you sure you want to approve this post?').then(() =>
      mutApprove()
    );
  };

  const onDenyClick = async () => {
    confirm('Are you sure you want to deny this post?').then(() => mutDeny());
  };

  const updatedProps = {
    ...props,
    post: postDetailQuery.forumPost || ({} as any),
    onDraft,
    onPublish,
    onApproveClick,
    onDenyClick
  };

  return <Detail {...updatedProps} />;
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.forumPostDetail), {
      name: 'postDetailQuery',
      options: ({ _id }) => ({
        variables: {
          _id
        },
        fetchPolicy: 'network-only'
      })
    })
  )(PostDetail)
);
