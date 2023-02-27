import React from 'react';
import { useMutation } from 'react-apollo';
import gql from 'graphql-tag';
import ChoiceDetail from '../../components/quiz/ChoiceDetail';
import { mutations } from '../../graphql';
import { confirm } from '@erxes/ui/src/utils';
import { IChoice } from '../../types';

type Props = {
  choice: IChoice;
  index?: number;
  quizId: string;
};

const Choice = ({ choice, index, quizId }: Props) => {
  const { _id } = choice;
  const [mutDel] = useMutation(gql(mutations.quizChoiceDelete));

  const onDelete = () => {
    confirm('Are you sure you want to delete this choice?').then(() =>
      mutDel({ variables: { _id }, refetchQueries: ['ForumQuizQuestion'] })
    );
  };

  return (
    <ChoiceDetail
      quizId={quizId}
      index={index}
      choice={choice}
      onDelete={onDelete}
    />
  );
};

export default Choice;
