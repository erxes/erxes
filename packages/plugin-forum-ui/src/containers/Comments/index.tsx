import React from 'react';
import CommentForm from './CommentForm';
import Comment from './Comment';
import { useQuery } from 'react-apollo';
import { FORUM_COMMENTS } from '../../graphql/queries';

const Comments: React.FC<{ postId: string }> = ({ postId }) => {
  const { data, loading, error, refetch } = useQuery(FORUM_COMMENTS, {
    variables: {
      postId: [postId],
      replyToId: [null]
    }
  });
  const comments: any[] = [];

  return (
    <div>
      <CommentForm
        key={postId}
        postId={postId}
        onCommentCreated={() => refetch()}
      />
      {error && <pre>error.message</pre>}
      {!loading &&
        !error &&
        (data.forumComments || []).map(c => (
          <Comment key={c._id} comment={c} />
        ))}
    </div>
  );
};

export default Comments;
