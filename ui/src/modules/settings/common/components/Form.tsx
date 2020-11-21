import Button from 'modules/common/components/Button';
import CommonForm from 'modules/common/components/form/Form';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import { ICommonFormProps } from '../types';

type Props = {
  confirmationUpdate?: boolean;
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
      confirmationUpdate,
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
            uppercase={false}
            onClick={closeModal}
            icon="times-circle"
          >
            Cancel
          </Button>

          {renderButton &&
            renderButton({
              name: name || '',
              values: this.props.generateDoc(values),
              isSubmitted,
              callback: closeModal,
              object,
              confirmationUpdate: object ? confirmationUpdate : false
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
