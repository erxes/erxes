import React from 'react';
import {
  IButtonMutateProps,
  IFormProps,
  IAttachment
} from '@erxes/ui/src/types';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import Uploader from '@erxes/ui/src/components/Uploader';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IQuestion, IChoice } from '../../types';
import { readFile } from '@erxes/ui/src/utils';

type Props = {
  question?: IQuestion;
  choice?: IChoice;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  quizId: string;
  type?: string;
  questionId?: string;
};

const QuizQuestionForm: React.FC<Props> = ({
  question,
  renderButton,
  closeModal,
  quizId,
  type,
  choice,
  questionId
}) => {
  const defaultFile = question
    ? {
        url: question.imageUrl,
        name: 'Question image',
        type: 'image'
      }
    : choice
    ? {
        url: choice.imageUrl,
        name: 'Choice image',
        type: 'image'
      }
    : ({} as IAttachment);
  const [image, setImage] = React.useState(defaultFile);
  const [isMultipleChoice, setIsMultipleChoice] = React.useState(
    question?.isMultipleChoice || false
  );
  const [isCorrect, setIsCorrect] = React.useState(choice?.isCorrect || false);

  const generateDoc = (values: {
    _id: string;
    text?: string;
    imageUrl?: string;
    listOrder: string;
  }) => {
    const finalValues = values;

    if (question) {
      finalValues._id = question._id;
    }

    if (choice) {
      finalValues._id = choice._id;
    }

    return {
      _id: finalValues._id,
      text: finalValues.text,
      imageUrl: readFile(image.url) || '',
      isMultipleChoice,
      listOrder: parseInt(finalValues.listOrder, 10),
      quizId,
      isCorrect,
      questionId
    };
  };

  const onChangeAttachment = attachment =>
    setImage(
      attachment && attachment.length !== 0
        ? attachment[0]
        : ({} as IAttachment)
    );

  const checkboxOptions = props => {
    if (type === 'choice') {
      return (
        <FormGroup>
          <ControlLabel>Is correct</ControlLabel>
          <FormControl
            {...props}
            name="isMultipleChoice"
            className="toggle-message"
            componentClass="checkbox"
            checked={isCorrect}
            onChange={() => {
              setIsCorrect(!isCorrect);
            }}
          />
        </FormGroup>
      );
    }

    return (
      <FormGroup>
        <ControlLabel>Multiple Choice</ControlLabel>
        <FormControl
          {...props}
          name="isMultipleChoice"
          className="toggle-message"
          componentClass="checkbox"
          checked={isMultipleChoice}
          onChange={() => {
            setIsMultipleChoice(!isMultipleChoice);
          }}
        />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted, values } = formProps;

    let object = question || ({} as IQuestion);

    if (type === 'choice') {
      object = choice || ({} as IChoice);
    }

    const images = Object.keys(image).length === 0 ? [] : [image];

    return (
      <>
        <FormGroup>
          <ControlLabel>Text</ControlLabel>
          <FormControl
            {...formProps}
            name="text"
            defaultValue={object.text || ''}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Image</ControlLabel>
          <Uploader
            defaultFileList={images}
            onChange={onChangeAttachment}
            single={true}
          />
        </FormGroup>

        {checkboxOptions({ ...formProps })}

        <FormGroup>
          <ControlLabel>{__('List Order')}</ControlLabel>
          <FormControl
            {...formProps}
            name="listOrder"
            type="number"
            defaultValue={object.listOrder || 0}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          {renderButton({
            passedName: type === 'choice' ? 'choice' : 'question',
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: type === 'choice' ? choice : question
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default QuizQuestionForm;
