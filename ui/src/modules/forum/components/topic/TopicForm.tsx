import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import { ITopic } from '../../types';

type Props = {
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  forumId: string;
  topic: ITopic;
};
class TopicForm extends React.Component<Props> {
  generateDoc = (values: {
    _id?: string;
    title: string;
    description: string;
  }) => {
    const { forumId, topic } = this.props;

    const finalValues = values;

    if (topic) {
      finalValues._id = topic._id;
    }

    return {
      _id: finalValues._id,

      title: finalValues.title,
      description: finalValues.description,
      forumId
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton, topic } = this.props;
    const { values, isSubmitted } = formProps;

    const object = topic || ({} as ITopic);

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Title</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={object.title}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl
            {...formProps}
            name="description"
            defaultValue={object.description}
          />
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          {renderButton({
            name: 'topic',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
            object: topic
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default TopicForm;
