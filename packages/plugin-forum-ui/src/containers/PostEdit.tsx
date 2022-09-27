import React from 'react';
import { useQuery, useMutation } from 'react-apollo';
import { FORUM_POST_DETAIL, POST_REFETCH_AFTER_EDIT } from '../graphql/queries';
import PostForm from '../components/PostForm';
import { useParams, useHistory } from 'react-router-dom';
import gql from 'graphql-tag';

const PATCH_POST = gql`
  mutation ForumPatchPost(
    $id: ID!
    $categoryId: [ID!]
    $content: String
    $thumbnail: String
    $title: String
  ) {
    forumPatchPost(
      _id: $id
      categoryId: $categoryId
      content: $content
      thumbnail: $thumbnail
      title: $title
    ) {
      _id
    }
  }
`;

const PostEdit: React.FC = () => {
  const { postId } = useParams();
  const history = useHistory();

  const { data, loading, error } = useQuery(FORUM_POST_DETAIL, {
    variables: {
      _id: postId
    }
  });

  const [patchPost] = useMutation(PATCH_POST, {
    onCompleted: () => {
      history.push(`/forums/posts/${postId}`);
    },
    onError: e => {
      alert(JSON.stringify(e, null, 2));
    },
    refetchQueries: POST_REFETCH_AFTER_EDIT
  });

  if (loading) return null;
  if (error) <pre>{JSON.stringify(error, null, 2)}</pre>;

  const onSubmit = async variables => {
    const res = await patchPost({
      variables: {
        ...variables,
        id: postId
      }
    });
  };

  return (
    <div>
      <PostForm post={data.forumPost} onSubmit={onSubmit} />
    </div>
  );
};

export default PostEdit;
