import { mutations, queries } from '../../graphql';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import CommentForm from '../../components/comment/CommentForm';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import gql from 'graphql-tag';

const CommentFormContainer: React.FC<{ postId: string }> = ({ postId }) => {
  const renderButton = ({ values, isSubmitted }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={mutations.createComment}
        variables={values}
        refetchQueries={[
          [
            {
              query: gql(queries.forumComments),
              variables: {
                replyToId: [values._id],
                sort: { _id: -1 }
              }
            }
          ]
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
