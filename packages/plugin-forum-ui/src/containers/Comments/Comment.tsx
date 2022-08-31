import React, { useState } from 'react';
import CommentForm from './CommentForm';
import { useQuery } from 'react-apollo';
import { FORUM_COMMENTS } from '../../graphql/queries';

const Comment: React.FC<{ comment: any }> = ({ comment }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const replyQuery = useQuery(FORUM_COMMENTS, {
    variables: {
      replyToId: [comment._id]
    }
  });

  return (
    <div style={{ border: '1px solid grey', padding: 10 }}>
      <p style={{ whiteSpace: 'pre' }}>{comment.content}</p>
      {showReplyForm && (
        <button onClick={() => setShowReplyForm(false)}>Cancel</button>
      )}
      <button type="button" onClick={() => setShowReplyForm(true)}>
        Reply
      </button>
      <div style={{ marginLeft: 40 }}>
        {showReplyForm && (
          <CommentForm
            key={'form' + comment._id}
            replyToId={comment._id}
            postId={comment.postId}
            onCommentCreated={() => replyQuery.refetch()}
          />
        )}

        {!replyQuery.loading &&
          !replyQuery.error &&
          replyQuery.data?.forumComments.length > 0 && (
            <>
              <p>Replies:</p>
              {(replyQuery.data?.forumComments || []).map(r => (
                <Comment comment={r} key={r._id} />
              ))}
            </>
          )}
      </div>
    </div>
  );
};

export default Comment;
