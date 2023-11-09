import React from 'react';
import CommonForm from '@erxes/ui/src/components/form/Form';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  __
} from '@erxes/ui/src';
import { ModalFooter } from '@erxes/ui/src/styles/main';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  bot?: any;
};

type State = {
  doc: any;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      doc: null
    };
  }

  generateDoc(values) {
    return { ...this.state.doc, ...values };
  }

  renderContent = (formProps: IFormProps) => {
    const { isSubmitted, values } = formProps;

    const { renderButton, closeModal, bot } = this.props;
    console.log('sdfsghg');

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Name')}</ControlLabel>
          <FormControl {...formProps} name="name" required />
        </FormGroup>
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Close')}
          </Button>
          {renderButton({
            name: 'Indicator',
            values: this.generateDoc(values),
            isSubmitted,
            object: bot
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    console.log('vd');
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
