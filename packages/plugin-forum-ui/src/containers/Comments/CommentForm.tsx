import React, { useState } from 'react';
import { useMutation } from 'react-apollo';
import { CREATE_COMMENT } from '../../graphql/mutations';

const CommentForm: React.FC<{
  replyToId?: string;
  postId: string;
  onCommentCreated?: () => any;
}> = ({ replyToId, postId, onCommentCreated }) => {
  const [content, setContent] = useState('');
  const [createComment] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      setContent('');
      if (onCommentCreated) {
        onCommentCreated();
      }
    },
    refetchQueries: ['ForumPostDetail']
  });

  const onSubmitComment = () => {
    createComment({
      variables: {
        postId,
        replyToId,
        content
      }
    });
  };

  return (
    <div>
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        cols={100}
        rows={3}
      />
      <button type="button" onClick={onSubmitComment}>
        Leave a {replyToId ? 'reply' : 'comment'}
      </button>
    </div>
  );
};

export default CommentForm;
