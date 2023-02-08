import React from 'react';
import CommentForm from '../../components/comment/CommentForm';
import { queries, mutations } from '../../graphql';
import gql from 'graphql-tag';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';

const CommentFormContainer: React.FC<{ postId: string }> = ({ postId }) => {
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
      />
    );
  };

  return <CommentForm postId={postId} renderButton={renderButton} />;
};

export default CommentFormContainer;
