import React from 'react';
import { mutations } from '../../graphql';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IQuestion, IChoice } from '../../types';
import QuestionForm from '../../components/quiz/QuestionForm';

type Props = {
  question?: IQuestion;
  choice?: IChoice;
  closeModal: () => void;
  quizId: string;
  type?: string;
  questionId?: string;
};

function QuestionFormContainer({
  closeModal,
  question,
  quizId,
  type,
  choice,
  questionId
}: Props) {
  const renderButton = ({
    passedName: name,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    const mutationType = () => {
      if (name === 'choice') {
        return object ? mutations.quizChoicePatch : mutations.createChoice;
      }

      return object
        ? mutations.quizQuestionPatch
        : mutations.createQuizQuestion;
    };

    return (
      <ButtonMutate
        mutation={mutationType()}
        variables={values}
        callback={callback}
        refetchQueries={['ForumQuiz', 'ForumQuizQuestion']}
        type="submit"
        isSubmitted={isSubmitted}
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } an ${name}`}
      />
    );
  };

  return (
    <QuestionForm
      renderButton={renderButton}
      closeModal={closeModal}
      question={question}
      quizId={quizId}
      type={type}
      choice={choice}
      questionId={questionId}
    />
  );
}

export default QuestionFormContainer;
