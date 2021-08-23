import React from 'react';
import { ModalFooter } from 'modules/common/styles/main';
import { NoteContainer } from 'modules/automations/styles';
import FormControl from 'modules/common/components/form/Control';
import { IFormProps, IButtonMutateProps } from 'modules/common/types';
import Button from 'modules/common/components/Button';
import { __ } from 'modules/common/utils';
import { IAutomationNote } from 'modules/automations/types';

type Props = {
  formProps: IFormProps;
  notes?: IAutomationNote[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

type State = {
  currentTab: string;
  currentType: string;
};

class NoteForm extends React.Component<Props, State> {
  generateDoc = (values: {
    _id?: string;
    groupId: string;
    validation: string;
    text: string;
    description: string;
  }) => {
    // const { field } = this.props;

    const finalValues = values;

    // if (field) {
    //   finalValues._id = field._id;
    // }

    return {
      ...finalValues
    };
  };

  render() {
    const { formProps, closeModal, renderButton } = this.props;

    const { values, isSubmitted } = formProps;

    return (
      <NoteContainer>
        <FormControl
          {...formProps}
          name="description"
          componentClass="textarea"
          rows={5}
          placeholder="Leave a note..."
          // defaultValue={event && event.description}
        />
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
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </NoteContainer>
    );
  }
}

export default NoteForm;
