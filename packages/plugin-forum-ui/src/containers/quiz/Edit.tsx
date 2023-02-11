import React from 'react';

import { useQuery, useMutation } from 'react-apollo';
import { useParams, useHistory } from 'react-router-dom';
import gql from 'graphql-tag';
import Form from '../../components/QuizForm';

const QUERY = gql`
  query ForumQuiz($id: ID!) {
    forumQuiz(_id: $id) {
      _id
      postId
      companyId
      tagIds
      categoryId
      name
      description
      isLocked
    }
  }
`;

const PATCH = gql`
  mutation ForumQuizPatch(
    $id: ID!
    $categoryId: ID
    $companyId: ID
    $description: String
    $name: String
    $postId: ID
    $tagIds: [ID!]
  ) {
    forumQuizPatch(
      _id: $id
      categoryId: $categoryId
      companyId: $companyId
      description: $description
      name: $name
      postId: $postId
      tagIds: $tagIds
    ) {
      _id
    }
  }
`;

const EditQuiz: React.FC = () => {
  const { quizId } = useParams();

  const { data, loading, error } = useQuery(QUERY, {
    variables: { id: quizId }
  });
  const history = useHistory();

  const [patch] = useMutation(PATCH, {
    onCompleted: () => {
      history.push(`/forums/quizzes/${quizId}`);
    },
    onError: e => alert(e.message)
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const quiz = data.forumQuiz;

  const onSubmit = async (quiz: any) => {
    // console.log(quiz);
    // return;
    await patch({
      variables: {
        ...quiz,
        id: quizId
      }
    });
  };

  return (
    <div>
      <Form quiz={quiz} onSubmit={onSubmit} />
    </div>
  );
};

export default EditQuiz;
