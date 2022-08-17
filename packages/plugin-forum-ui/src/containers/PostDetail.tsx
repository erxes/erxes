import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-apollo';
import { FORUM_POST_DETAIL } from '../graphql/queries';

const PostDetail: React.FC = () => {
  const { postId } = useParams();
  const { data, loading, error } = useQuery(FORUM_POST_DETAIL, {
    variables: { _id: postId }
  });

  if (loading) return null;

  if (error) return <pre>{error.message}</pre>;

  const { forumPost } = data;

  const onClickDelete = () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '50px 0 0 0'
      }}
    >
      <div>
        <p>State: {forumPost.state}</p>
        {forumPost.thumbnail && <img src={forumPost.thumbnail} />}

        <Link to={`/forums/posts/${postId}/edit`}>Edit</Link>
        <button onClick={onClickDelete}>Delete</button>
      </div>
      <hr />
      <div>
        <h1>{forumPost.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: forumPost.content }}></div>
      </div>
    </div>
  );
};

export default PostDetail;
