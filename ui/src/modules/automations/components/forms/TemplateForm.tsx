import React from 'react';
import { ModalFooter } from 'modules/common/styles/main';
import FormControl from 'modules/common/components/form/Control';
import { IFormProps, IButtonMutateProps } from 'modules/common/types';
import Button from 'modules/common/components/Button';
import { Alert, __ } from 'modules/common/utils';

type Props = {
  formProps: IFormProps;
  automation: any;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

class TemplateForm extends React.Component<Props> {
  generateDoc = (values: { name: string }) => {
    if (values.name) {
      return Alert.error('Please enter a template name');
    }

    return {
      ...values,
      ...this.props.automation
    };
  };

  render() {
    const { formProps, closeModal, renderButton } = this.props;

    const { values, isSubmitted } = formProps;

    return (
      <div>
        <FormControl {...formProps} name="name" placeholder="Template name" />
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
            values,
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </div>
    );
  }
}

export default TemplateForm;
