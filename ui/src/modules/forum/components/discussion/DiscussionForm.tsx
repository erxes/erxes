import React from 'react';
import Button from 'modules/common/components/Button';

import Form from 'modules/common/components/form/Form';

import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';

import { IButtonMutateProps, IFormProps } from 'modules/common/types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  currentTopicId: string;
};

class DiscussionForm extends React.Component<Props> {
  generateDoc = (values: {
    _id?: string;
    title: string;
    description: string;
  }) => {
    const { currentTopicId } = this.props;

    const finalValues = values;

    return {
      _id: finalValues._id,
      doc: {
        topicId: currentTopicId,
        title: finalValues.title,
        description: finalValues.description
      }
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Title</ControlLabel>
          <FormControl
            {...formProps}
            name="title"
            defaultValue={''}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Description</ControlLabel>
          <FormControl {...formProps} name="description" defaultValue={''} />
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
            callback: closeModal
            // object: category
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default DiscussionForm;
