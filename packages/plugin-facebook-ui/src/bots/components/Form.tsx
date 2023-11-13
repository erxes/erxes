import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  __
} from '@erxes/ui/src';
import CommonForm from '@erxes/ui/src/components/form/Form';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { SelectAccount, SelectAccountPages } from '../utils';
import { Features } from '../styles';

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
      doc: props?.bot ? props.bot : null
    };
  }

  generateDoc(values) {
    const { doc } = this.state;

    return { ...(doc || {}), ...values };
  }

  renderContent = (formProps: IFormProps) => {
    const { isSubmitted, values } = formProps;

    const { renderButton, closeModal, bot } = this.props;
    const { doc } = this.state;

    const onSelect = (value, name) => {
      this.setState({ doc: { ...doc, [name]: value } });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Name')}</ControlLabel>
          <FormControl {...formProps} name="name" required value={doc?.name} />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Accounts')}</ControlLabel>
          <SelectAccount
            initialValue={doc?.accountId}
            name="accountId"
            label="select a account"
            onSelect={onSelect}
          />
        </FormGroup>
        <Features isToggled={doc?.accountId}>
          <FormGroup>
            <ControlLabel>{__('Pages')}</ControlLabel>
            <SelectAccountPages
              accountId={doc?.accountId}
              initialValue={doc?.pageId}
              name="pageId"
              label="select a page"
              onSelect={onSelect}
            />
          </FormGroup>
        </Features>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Close')}
          </Button>
          {renderButton({
            name: 'Bot',
            values: this.generateDoc(values),
            isSubmitted,
            object: bot
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm renderContent={this.renderContent} />;
  }
}

export default Form;
