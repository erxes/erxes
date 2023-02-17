import React from 'react';
import { useQuery, useMutation } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import gql from 'graphql-tag';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IQuiz } from '../../types';
import QuizForm from '../../components/quiz/QuizForm';
import { Alert, confirm } from '@erxes/ui/src/utils';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  quiz?: IQuiz;
  closeModal: () => void;
};

function QuizFormContainer({ closeModal, quiz }: Props) {
  const categoriesQuery = useQuery(gql(queries.categoriesAll));

  const tagsQuery = useQuery(gql(queries.tags), {
    fetchPolicy: 'network-only'
  });

  const companiesQuery = useQuery(gql(queries.companiesList), {
    fetchPolicy: 'network-only'
  });

  const detailQuery = useQuery(gql(queries.quizDetail), {
    variables: { _id: quiz ? quiz._id : '' }
  });

  const [mutSetState] = useMutation(gql(mutations.setQuizState));

  const [deleteQuestion] = useMutation(gql(mutations.deleteQuizQuestion));

  const forumCategories = categoriesQuery.data?.forumCategories || [];
  const tags = tagsQuery.data?.tags || [];
  const companies = companiesQuery.data?.companies || [];
  const detail = detailQuery.data?.forumQuiz || {};

  const changeState = async (state: string, _id: string) => {
    mutSetState({ variables: { _id, state } }).catch(e =>
      Alert.error(e.message)
    );
  };

  const loading =
    categoriesQuery.loading ||
    detailQuery.loading ||
    tagsQuery.loading ||
    companiesQuery.loading;

  if (loading) {
    return <Spinner objective={true} />;
  }

  const renderButton = ({
    passedName: name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    return (
      <ButtonMutate
        mutation={object ? mutations.updateQuiz : mutations.createQuiz}
        variables={values}
        callback={callback}
        refetchQueries={['ForumQuizzes']}
        type="submit"
        isSubmitted={isSubmitted}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } an ${name}`}
      />
    );
  };

  const onDeleteQuestion = async (_id: string) => {
    confirm('Are you sure you want to delete this question?').then(() =>
      deleteQuestion({
        variables: {
          _id
        },
        refetchQueries: ['ForumQuiz']
      })
    );
  };

  return (
    <QuizForm
      quiz={detail}
      companies={companies}
      tags={tags}
      categories={forumCategories}
      renderButton={renderButton}
      closeModal={closeModal}
      changeState={changeState}
      refetch={detailQuery.refetch}
      onDelete={onDeleteQuestion}
    />
  );
}

export default QuizFormContainer;
