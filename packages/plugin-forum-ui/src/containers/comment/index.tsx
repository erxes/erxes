import React from 'react';
import { useQuery } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import gql from 'graphql-tag';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import CommentComponent from '../../components/comment';

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

  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.createComment}
        variables={values}
        refetchQueries={[
          {
            query: gql(queries.forumPostDetail),
            variables: {
              _id: postId
            }
          }
        ]}
        type="submit"
        isSubmitted={isSubmitted}
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
