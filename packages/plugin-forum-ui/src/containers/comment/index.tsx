import { mutations, queries } from '../../graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import CommentComponent from '../../components/comment';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client';

const Comments: React.FC<{ postId: string }> = ({ postId }) => {
  const { data, loading, error, refetch } = useQuery(
    gql(queries.forumComments),
    {
      variables: {
        postId: [postId],
        replyToId: [null]
      }
    }
  );

  const renderButton = ({
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.createComment}
        variables={values}
        refetchQueries={['ForumComments']}
        type="submit"
        isSubmitted={isSubmitted}
        callback={callback}
        icon="send"
        children=""
        successMessage="You successfully write a comment"
      />
    );
  };

  return (
    <CommentComponent
      renderButton={renderButton}
      data={data}
      loading={loading}
      refetch={refetch}
      error={error}
      postId={postId}
    />
  );
};

export default Comments;
