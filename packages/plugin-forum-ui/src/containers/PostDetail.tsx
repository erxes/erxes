import React from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { useQuery, useMutation } from 'react-apollo';
import { FORUM_POST_DETAIL } from '../graphql/queries';
import gql from 'graphql-tag';

const DELETE_POST = gql`
  mutation ForumDeletePost($_id: ID!) {
    forumDeletePost(_id: $_id) {
      _id
    }
  }
`;

const PostDetail: React.FC = () => {
  const history = useHistory();
  const { postId } = useParams();
  const { data, loading, error } = useQuery(FORUM_POST_DETAIL, {
    variables: { _id: postId },
    fetchPolicy: 'network-only'
  });

  const [deleteMutation] = useMutation(DELETE_POST, {
    variables: {
      _id: postId
    },
    onCompleted: () => {
      history.replace(`/forums/posts`);
    },
    onError: e => alert(e.message)
  });

  if (loading) return null;

  if (error) return <pre>{error.message}</pre>;

  const { forumPost } = data;

  const onClickDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    await deleteMutation();
  };

  return (
    <div>
      <table>
        <tbody>
          <tr>
            <td>State: </td>
            <td>{forumPost.state}</td>
          </tr>
          <tr>
            <td>Thumbnail: </td>
            <td>{forumPost.thumbnail && <img src={forumPost.thumbnail} />}</td>
          </tr>
          <tr>
            <td>Title: </td>
            <td>{forumPost.title}</td>
          </tr>
          <tr>
            <td>Content: </td>
            <td>
              <div
                dangerouslySetInnerHTML={{ __html: forumPost.content }}
              ></div>
            </td>
          </tr>
        </tbody>
      </table>
      <hr />
      <div>
        <Link to={`/forums/posts/${postId}/edit`}>Edit</Link>
        <button onClick={onClickDelete}>Delete</button>
      </div>
    </div>
  );
};

export default PostDetail;
