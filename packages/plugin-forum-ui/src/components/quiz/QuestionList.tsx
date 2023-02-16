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

const QuestionList: React.FC<{
  question?: any;
  index?: number;
  quizId: string;
  onDeleteQuestion?: () => any;
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
                    id="choiceDelete"
                    btnStyle="link"
                    icon="times-circle"
                    onClick={onDeleteQuestion}
                  />
                </Tip>
              </ActionButtons>
            </FlexItem>
          </MarginAuto>
        </FlexContent>
      </StepHeader>

      <StepBody>
        {question.choices?.length
          ? question.choices.map((c, i) => (
              <Choice key={c._id} choice={c} index={i} quizId={quizId} />
            ))
          : 'No choices'}
      </StepBody>
    </StepItem>
  );
};

export default QuestionList;
