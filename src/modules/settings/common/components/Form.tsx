import Button from 'modules/common/components/Button';
import CommonForm from 'modules/common/components/form/Form';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import { ICommonFormProps } from '../types';

type Props = {
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
  generateDoc: (values: any) => any;
  object?: any;
  name?: string;
  renderContent(formProps: IFormProps): any;
};

class Form extends React.Component<Props & ICommonFormProps> {
  renderFormContent = (formProps: IFormProps) => {
    const {
      renderContent,
      renderButton,
      closeModal,
      object,
      name
    } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        {renderContent({ ...formProps })}

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          {renderButton &&
            renderButton({
              name: name || '',
              values: this.props.generateDoc(values),
              isSubmitted,
              callback: closeModal,
              object
            })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderFormContent} />;
  }
}

export default Form;
