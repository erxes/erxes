import React from 'react';
import Choice from '../../containers/quiz/Choice';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils';
import QuestionForm from '../../containers/quiz/QuestionForm';
import { StepBody, StepHeader, StepItem, MarginAuto } from '../../styles';
import { FlexContent, FlexItem } from '@erxes/ui/src/layout/styles';
import { IQuestion } from '../../types';

const QuestionList: React.FC<{
  question?: IQuestion;
  index?: number;
  quizId: string;
  onDeleteQuestion?: (_id: string) => void;
}> = ({ question, index, onDeleteQuestion, quizId }) => {
  const renderQuestionForm = props => (
    <QuestionForm {...props} question={question} quizId={quizId} />
  );

  const renderChoiceForm = props => (
    <QuestionForm
      questionId={question._id}
      {...props}
      type="choice"
      quizId={quizId}
    />
  );

  const renderChoises = () => {
    if (question.choices?.length > 0) {
      return question.choices.map((c, i) => (
        <Choice key={c._id} choice={c} index={i} quizId={quizId} />
      ));
    }

    return 'No choices';
  };

  return (
    <StepItem>
      <StepHeader>
        <FlexContent>
          <FlexItem>
            {index + 1}. {question.text}{' '}
            {question.isMultipleChoice ? '(Multiple choice)' : ''}{' '}
          </FlexItem>
          <MarginAuto>
            <FlexItem count={1.05}>
              <ActionButtons>
                <ModalTrigger
                  trigger={
                    <Button btnStyle="link">
                      <Tip text={__('Edit')} placement="top">
                        <Icon icon="edit-3" />
                      </Tip>
                    </Button>
                  }
                  content={renderQuestionForm}
                  title="Edit Question"
                />

                <ModalTrigger
                  trigger={
                    <Button btnStyle="link">
                      <Tip text={__('Add Choice')} placement="top">
                        <Icon icon="plus-circle" />
                      </Tip>
                    </Button>
                  }
                  content={renderChoiceForm}
                  title="Add Choice"
                />

                <Tip text={__('Delete')} placement="top">
                  <Button
                    id="questionDelete"
                    btnStyle="link"
                    icon="times-circle"
                    onClick={() => onDeleteQuestion(quizId)}
                  />
                </Tip>
              </ActionButtons>
            </FlexItem>
          </MarginAuto>
        </FlexContent>
      </StepHeader>

      <StepBody>{renderChoises()}</StepBody>
    </StepItem>
  );
};

export default QuestionList;
