import React from 'react';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';
import QuestionForm from '../../containers/quiz/QuestionForm';
import { IChoice } from '../../types';
import { __ } from '@erxes/ui/src/utils';
import { FlexItem } from '@erxes/ui/src/layout/styles';
import { MarginAuto, ChoiceList, ChoiseTitle } from '../../styles';

type Props = {
  index?: number;
  choice: IChoice;
  quizId: string;
  onDelete?: () => void;
};

const ChoiceDetail = ({ choice, index, onDelete, quizId }: Props) => {
  const renderQuestionForm = props => (
    <QuestionForm type="choice" choice={choice} {...props} quizId={quizId} />
  );

  return (
    <ChoiceList>
      <FlexItem>
        <ChoiseTitle isCorrect={choice.isCorrect}>
          {index != null && `${index + 1}. `}
          {choice.text}
        </ChoiseTitle>
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
              title="Edit Choice"
            />

            <Tip text={__('Delete')} placement="top">
              <Button
                id="choiceDelete"
                btnStyle="link"
                icon="times-circle"
                onClick={onDelete}
              />
            </Tip>
          </ActionButtons>
        </FlexItem>
      </MarginAuto>
    </ChoiceList>
  );
};

export default ChoiceDetail;
