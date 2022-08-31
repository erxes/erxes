import React from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { useQuery, useMutation } from 'react-apollo';
import { FORUM_POST_DETAIL, POST_REFETCH_AFTER_EDIT } from '../graphql/queries';
import gql from 'graphql-tag';
import Comments from './Comments';

const DELETE_POST = gql`
  mutation ForumDeletePost($_id: ID!) {
    forumDeletePost(_id: $_id) {
      _id
    }
  }
`;

const MUT_DRAFT = gql`
  mutation ForumPostDraft($_id: ID!) {
    forumPostDraft(_id: $_id) {
      _id
    }
  }
`;

const MUT_PUBLISH = gql`
  mutation ForumPostDraft($_id: ID!) {
    forumPostPublish(_id: $_id) {
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

  const [mutDraft] = useMutation(MUT_DRAFT, {
    variables: { _id: postId },
    refetchQueries: POST_REFETCH_AFTER_EDIT
  });

  const [mutPublish] = useMutation(MUT_PUBLISH, {
    variables: { _id: postId },
    refetchQueries: POST_REFETCH_AFTER_EDIT
  });

  if (loading) return null;

  if (error) return <pre>{error.message}</pre>;

  const { forumPost } = data;

  const onClickDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    await deleteMutation();
  };

  const onDraft = async () => {
    if (!confirm('Are you sure you want to save as draft')) return;
    await mutDraft();
  };

  const onPublish = async () => {
    if (!confirm('Are you sure you want to publish?')) return;
    await mutPublish();
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
            <td>Created at: </td>
            <td>{forumPost.createdAt}</td>
            <td>Created by: </td>
            <td>
              {forumPost.createdBy?.username ||
                forumPost.createdBy?.email ||
                forumPost.createdBy?._id}
            </td>
          </tr>
          <tr>
            <td>Updated at: </td>
            <td>{forumPost.updatedAt}</td>
            <td>Updated by: </td>
            <td>
              {forumPost.updatedBy?.username ||
                forumPost.updatedBy?.email ||
                forumPost.updatedBy?._id}
            </td>
          </tr>
          <tr>
            <td>State changed at: </td>
            <td>{forumPost.stateChangedAt}</td>
            <td>State changed by: </td>
            <td>
              {forumPost.stateChangedBy?.username ||
                forumPost.stateChangedBy?.email ||
                forumPost.stateChangedBy?._id}
            </td>
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
        {forumPost.state !== 'DRAFT' && (
          <button onClick={onDraft}>Turn into draft</button>
        )}
        {forumPost.state !== 'PUBLISHED' && (
          <button onClick={onPublish}>Publish</button>
        )}
        <Link to={`/forums/posts/${postId}/edit`}>Edit</Link>
        <button onClick={onClickDelete}>Delete</button>
      </div>
      <hr />
      <h1>Comments: {forumPost.commentCount}</h1>
      <Comments postId={postId} />
    </div>
  );
};

export default PostDetail;
