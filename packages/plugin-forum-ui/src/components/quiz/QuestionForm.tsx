import React from 'react';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils';
import Button from '@erxes/ui/src/components/Button';
import Uploader from '@erxes/ui/src/components/Uploader';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IQuestion, IChoice } from '../../types';

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
  const [image, setImage] = React.useState({ url: question?.imageUrl } as any);
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
      imageUrl: image.url,
      isMultipleChoice,
      listOrder: parseInt(finalValues.listOrder, 10),
      quizId,
      isCorrect,
      questionId
    };
  };

  const onChangeAttachment = attachment => {
    setImage({ attachment });
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted, values } = formProps;

    let object = question || ({} as any);

    if (type === 'choice') {
      object = choice || ({} as any);
    }

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
            defaultFileList={[]}
            onChange={onChangeAttachment}
            single={true}
            text="Upload an image"
            icon="upload-6"
          />
        </FormGroup>

        {type === 'choice' ? (
          <FormGroup>
            <ControlLabel>Is correct</ControlLabel>
            <FormControl
              {...formProps}
              name="isMultipleChoice"
              className="toggle-message"
              componentClass="checkbox"
              checked={isCorrect}
              onChange={() => {
                setIsCorrect(!isCorrect);
              }}
            />
          </FormGroup>
        ) : (
          <FormGroup>
            <ControlLabel>Multiple Choice</ControlLabel>
            <FormControl
              {...formProps}
              name="isMultipleChoice"
              className="toggle-message"
              componentClass="checkbox"
              checked={isMultipleChoice}
              onChange={() => {
                setIsMultipleChoice(!isMultipleChoice);
              }}
            />
          </FormGroup>
        )}

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
