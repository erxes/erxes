import React from 'react';
import { useParams, Link, useHistory } from 'react-router-dom';
import { useQuery, useMutation } from 'react-apollo';
import { FORUM_POST_DETAIL, POST_REFETCH_AFTER_EDIT } from '../graphql/queries';
import gql from 'graphql-tag';
import Comments from './Comments';
import { postUsername } from '../utils';

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

const MUT_APPROVE = gql`
  mutation ForumPostApprove($_id: ID!) {
    forumPostApprove(_id: $_id) {
      _id
    }
  }
`;

const MUT_DENY = gql`
  mutation ForumPostDeny($_id: ID!) {
    forumPostDeny(_id: $_id) {
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

  const [mutApprove] = useMutation(MUT_APPROVE, {
    variables: { _id: postId },
    refetchQueries: POST_REFETCH_AFTER_EDIT
  });

  const [mutDeny] = useMutation(MUT_DENY, {
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

  const onApproveClick = async () => {
    if (!confirm('Are you sure you want to approve this post?')) return;
    await mutApprove();
  };

  const onDenyClick = async () => {
    if (!confirm('Are you sure you want to deny this post?')) return;
    await mutDeny();
  };

  return (
    <div>
      <table>
        <tbody>
          <tr>
            <th>State: </th>
            <td>{forumPost.state}</td>
            <th>Category: </th>
            <td>{forumPost.category?.name || 'no category'}</td>
          </tr>
          <tr>
            <th>Thumbnail: </th>
            <td>
              {forumPost.thumbnail && (
                <img src={forumPost.thumbnail} style={{ maxHeight: 200 }} />
              )}
            </td>
            <th>Thumbnail url:</th>
            <td>{forumPost.thumbnail}</td>
          </tr>
          <tr>
            <th>Created at: </th>
            <td>{forumPost.createdAt}</td>
            <th>Created by: </th>
            <td>
              {postUsername({
                post: forumPost,
                typeKey: 'createdUserType',
                crmKey: 'createdBy',
                cpKey: 'createdByCp'
              })}
            </td>
          </tr>
          <tr>
            <th>Updated at: </th>
            <td>{forumPost.updatedAt}</td>
            <th>Updated by: </th>
            <td>
              {postUsername({
                post: forumPost,
                typeKey: 'updatedUserType',
                crmKey: 'updatedBy',
                cpKey: 'updatedByCp'
              })}
            </td>
          </tr>
          <tr>
            <th>Title: </th>
            <td>{forumPost.title}</td>
          </tr>
          <tr>
            <th>Content: </th>
            <td>
              <div
                style={{ border: '1px solid gray', padding: 10 }}
                dangerouslySetInnerHTML={{ __html: forumPost.content }}
              ></div>
            </td>
          </tr>
          <tr>
            <th>Description: </th>
            <td>
              <p
                style={{
                  whiteSpace: 'pre-wrap',
                  border: '1px solid gray',
                  padding: 10
                }}
              >
                {forumPost.description}
              </p>
            </td>
          </tr>
          {forumPost.pollOptions?.length && (
            <>
              <tr>
                <th>Poll options</th>
                <td>
                  <ul>
                    {forumPost.pollOptions?.map((option, index) => (
                      <li key={option._id}>{option.title}</li>
                    ))}
                  </ul>
                </td>
              </tr>
              <tr>
                <th>Poll type</th>
                <td>
                  {forumPost.isPollMultipleChoice
                    ? 'Multiple choice'
                    : 'Single choice'}
                </td>
              </tr>
            </>
          )}
          <tr>
            <th>Up vote count:</th>
            <td>{forumPost.upVoteCount}</td>
            <th>Down vote count:</th>
            <td>{forumPost.downVoteCount}</td>
          </tr>
        </tbody>
      </table>
      <hr />
      <div>
        {forumPost.state !== 'DRAFT' && (
          <button onClick={onDraft}>Turn into a draft</button>
        )}
        {forumPost.state !== 'PUBLISHED' && (
          <button onClick={onPublish}>Publish</button>
        )}
        <Link to={`/forums/posts/${postId}/edit`}>Edit</Link>
        <button onClick={onClickDelete}>Delete</button>
      </div>
      <hr />
      {forumPost.category?.postsReqCrmApproval && (
        <>
          <div>
            <h5>Category approval: {forumPost.categoryApprovalState}</h5>
            <button type="button" onClick={onApproveClick}>
              Approve
            </button>
            <button type="button" onClick={onDenyClick}>
              Deny
            </button>
          </div>
          <hr />
        </>
      )}

      <h1>View count: {forumPost.viewCount}</h1>
      <h1>Comments: {forumPost.commentCount}</h1>
      <Comments postId={postId} />
    </div>
  );
};

export default PostDetail;
