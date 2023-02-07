import React from 'react';
import PostForm from '../components/PostForm';
import gql from 'graphql-tag';
import { useMutation } from 'react-apollo';
import { POST_REFETCH_AFTER_CREATE_DELETE } from '../graphql/queries';
import { useHistory } from 'react-router-dom';

const MUTATION = gql`
  mutation ForumCreatePost(
    $categoryId: ID!
    $content: String!
    $title: String!
    $thumbnail: String
    $description: String
    $tagIds: [ID!]
    $pollOptions: [ForumPollOptionInput!]
    $isPollMultiChoice: Boolean
    $pollEndDate: Date
  ) {
    forumCreatePost(
      categoryId: $categoryId
      content: $content
      title: $title
      thumbnail: $thumbnail
      description: $description
      tagIds: $tagIds
      pollOptions: $pollOptions
      isPollMultiChoice: $isPollMultiChoice
      pollEndDate: $pollEndDate
    ) {
      _id
    }
  }
`;

const NewPost: React.FC = () => {
  const [mutation] = useMutation(MUTATION, {
    refetchQueries: POST_REFETCH_AFTER_CREATE_DELETE,
    onError: e => alert(JSON.stringify(e, null, 2))
  });

  const history = useHistory();

  const onSubmit = async variables => {
    const {
      data: {
        forumCreatePost: { _id }
      }
    } = await mutation({ variables });

    history.push(`/forums/posts/${_id}`);
  };

  return (
    <div>
      <PostForm onSubmit={onSubmit} />
    </div>
  );
};

export default NewPost;
