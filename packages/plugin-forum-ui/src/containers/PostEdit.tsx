import React from 'react';
import { useQuery, useMutation } from 'react-apollo';
import PostForm from '../components/PostForm';
import { useParams, useHistory } from 'react-router-dom';
import { queries } from '../graphql';
import gql from 'graphql-tag';

const PATCH_POST = gql`
  mutation ForumPatchPost(
    $id: ID!
    $categoryId: ID!
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

  const { data, loading, error } = useQuery(gql(queries.forumPostDetail), {
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
    refetchQueries: queries.postRefetchAfterEdit
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
