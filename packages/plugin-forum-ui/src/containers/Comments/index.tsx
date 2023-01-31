import React from 'react';
import CommentForm from '../../components/comment/CommentForm';
import Comment from './Comment';
import { useQuery } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import gql from 'graphql-tag';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { CommentSection } from '../../styles';

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
      />
    );
  };

  return (
    <CommentSection>
      <CommentForm key={postId} postId={postId} renderButton={renderButton} />
      {error && <pre>Error occured</pre>}
      {!loading &&
        !error &&
        (data.forumComments || []).map(c => (
          <Comment
            renderButton={renderButton}
            key={c._id}
            comment={c}
            onDeleted={refetch}
          />
        ))}
    </CommentSection>
  );
};

export default Comments;
