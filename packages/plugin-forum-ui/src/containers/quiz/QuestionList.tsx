import React from 'react';
import gql from 'graphql-tag';
import { useQuery, useMutation } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import List from '../../components/quiz/QuestionList';
import Spinner from '@erxes/ui/src/components/Spinner';
import { __, Alert, confirm } from '@erxes/ui/src/utils';

type Props = {
  _id?: string;
  index?: number;
  quizRefetch?: () => any;
};

const QuestionList = ({ _id, index, quizRefetch }: Props) => {
  const { data, loading, error, refetch } = useQuery(
    gql(queries.quizQuestion),
    {
      variables: {
        _id
      }
    }
  );

  const [deleteQuestion] = useMutation(gql(mutations.deleteQuizQuestion), {
    onCompleted: refetch
  });

  if (loading) {
    return <Spinner objective={true} />;
  }
  if (error) {
    Alert.error(error.message);
  }

  const question = data.forumQuizQuestion;

  const onDeleteQuestion = async () => {
    confirm('Are you sure you want to delete this question?').then(() =>
      deleteQuestion({
        variables: {
          id: _id
        },
        refetchQueries: ['ForumQuiz']
      })
    );
  };

  return (
    <List
      quizId={_id}
      index={index}
      onDeleteQuestion={onDeleteQuestion}
      question={question}
    />
  );
};

export default QuestionList;
