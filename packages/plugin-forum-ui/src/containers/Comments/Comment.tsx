import React, { useState } from 'react';
import CommentForm from './CommentForm';
import { useQuery, useMutation } from 'react-apollo';
import { FORUM_COMMENTS } from '../../graphql/queries';
import { DELETE_COMMENT } from '../../graphql/mutations';

const Comment: React.FC<{ comment: any; onDeleted?: (string) => any }> = ({
  comment,
  onDeleted
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const repliesQuery = useQuery(FORUM_COMMENTS, {
    variables: {
      replyToId: [comment._id]
    }
  });

  const [deleteMut] = useMutation(DELETE_COMMENT, {
    variables: {
      _id: comment._id
    },
    refetchQueries: ['ForumPostDetail']
  });

  const onDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete this comment: "${comment.content}"`
      )
    )
      return;
    await deleteMut();
    if (onDeleted) onDeleted(comment._id);
  };

  const createdByDisplayName =
    comment.createdBy?.username ||
    comment.createdBy?.email ||
    comment.createdBy?._id ||
    comment.createdByCp?.username ||
    comment.createdByCp?.email ||
    comment.createdByCp?._id;

  return (
    <div style={{ border: '1px solid grey', padding: 10 }}>
      <b>{createdByDisplayName}</b>
      <p style={{ whiteSpace: 'pre' }}>{comment.content}</p>
      {showReplyForm && (
        <button onClick={() => setShowReplyForm(false)}>Cancel</button>
      )}
      <button type="button" onClick={() => setShowReplyForm(true)}>
        Reply
      </button>
      <button type="button" onClick={onDelete}>
        Delete
      </button>
      <div style={{ marginLeft: 40 }}>
        {showReplyForm && (
          <CommentForm
            key={'form' + comment._id}
            replyToId={comment._id}
            postId={comment.postId}
            onCommentCreated={() => {
              repliesQuery.refetch();
              setShowReplyForm(false);
            }}
          />
        )}

        {!repliesQuery.loading &&
          !repliesQuery.error &&
          repliesQuery.data?.forumComments.length > 0 && (
            <>
              <p>Replies: {(repliesQuery.data?.forumComments || []).length}</p>
              {(repliesQuery.data?.forumComments || []).map(r => (
                <Comment
                  comment={r}
                  key={r._id}
                  onDeleted={repliesQuery.refetch}
                />
              ))}
            </>
          )}
      </div>
    </div>
  );
};

export default Comment;
