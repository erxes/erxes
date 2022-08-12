import React from 'react';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import FormControl from '@erxes/ui/src/components/form/Control';
import { IFormProps, IButtonMutateProps } from '@erxes/ui/src/types';
import Button from '@erxes/ui/src/components/Button';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  formProps: IFormProps;
  id: string;
  name: string;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

class TemplateForm extends React.Component<Props> {
  generateDoc = ({ name }: { name: string }) => {
    return {
      _id: this.props.id,
      name
    };
  };

  render() {
    const { formProps, closeModal, renderButton, name } = this.props;

    const { values, isSubmitted } = formProps;

    return (
      <div>
        <FormControl
          {...formProps}
          defaultValue={`${name} (template)`}
          name="name"
          placeholder={__('Template name')}
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
      </div>
    );
  }
}

export default TemplateForm;
