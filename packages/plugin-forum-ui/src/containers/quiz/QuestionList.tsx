import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';
import { queries } from '../../graphql';
import List from '../../components/quiz/QuestionList';
import Spinner from '@erxes/ui/src/components/Spinner';
import { __, Alert } from '@erxes/ui/src/utils';

type Props = {
  _id?: string;
  index?: number;
  onDelete?: (_id: string) => void;
};

const QuestionList = ({ _id, index, onDelete }: Props) => {
  const { data, loading, error, refetch } = useQuery(
    gql(queries.quizQuestion),
    {
      variables: {
        _id
      }
    }
  );

  if (loading) {
    return <Spinner objective={true} />;
  }
  if (error) {
    Alert.error(error.message);
  }

  const question = data.forumQuizQuestion;

  return (
    <List
      quizId={_id}
      index={index}
      onDeleteQuestion={onDelete}
      question={question}
    />
  );
};

export default QuestionList;
