import React from 'react';
import { ModalFooter } from 'modules/common/styles/main';
import FormControl from 'modules/common/components/form/Control';
import { IFormProps, IButtonMutateProps } from 'modules/common/types';
import Button from 'modules/common/components/Button';
import { __ } from 'modules/common/utils';

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
