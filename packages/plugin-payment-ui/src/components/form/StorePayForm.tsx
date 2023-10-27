import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';

import { IPaymentDocument, IStorepayConfig } from '../../types';
import { PAYMENT_KINDS } from '../constants';
import { SettingsContent } from './styles';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  payment?: IPaymentDocument;
  metaData?: any;
};

type State = {
  paymentName: string;
  merchantUsername: string;
  merchantPassword: string;

  appUsername: string;
  appPassword: string;

  storeId: string;
};

class StorepayConfigForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { payment } = this.props;
    const { name = '', config } = payment || ({} as IPaymentDocument);
    const {
      storeId,
      merchantPassword,
      merchantUsername,
      appUsername,
      appPassword
    } = config || ({} as IStorepayConfig);

    this.state = {
      paymentName: name,
      storeId,
      merchantPassword,
      merchantUsername,
      appUsername,
      appPassword
    };
  }

  generateDoc = (values: {
    paymentName: string;
    storeId: string;
    merchantPassword: string;
    merchantUsername: string;
    appUsername: string;
    appPassword: string;
  }) => {
    const { payment } = this.props;
    const generatedValues = {
      name: values.paymentName,
      kind: PAYMENT_KINDS.STOREPAY,
      status: 'active',
      config: {
        storeId: values.storeId,
        merchantPassword: values.merchantPassword,
        merchantUsername: values.merchantUsername,
        appUsername: values.appUsername,
        appPassword: values.appPassword
      }
    };

    return payment ? { ...generatedValues, id: payment._id } : generatedValues;
  };

  onChangeConfig = (code: string, e) => {
    this.setState({ [code]: e.target.value } as any);
  };

  renderItem = (
    key: string,
    title: string,
    description?: string,
    isPassword?: boolean
  ) => {
    const value = this.state[key];

    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        {description && <p>{description}</p>}
        <FormControl
          defaultValue={value}
          onChange={this.onChangeConfig.bind(this, key)}
          value={value}
          type={isPassword ? 'password' : ''}
        />
      </FormGroup>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { isSubmitted } = formProps;
    const {
      paymentName,
      storeId,
      merchantPassword,
      merchantUsername,
      appUsername,
      appPassword
    } = this.state;

    const values = {
      paymentName,
      storeId,
      merchantPassword,
      merchantUsername,
      appUsername,
      appPassword
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {this.renderItem('paymentName', 'Name')}
          {this.renderItem('storeId', 'Store id')}
          {this.renderItem('merchantUsername', 'Merchant username')}
          {this.renderItem('merchantPassword', 'Merchant password', '', true)}
          {this.renderItem('appUsername', 'App username')}
          {this.renderItem('appPassword', 'App password', '', true)}

          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScxZItJ5egDhNqSOMTj6np6d9yrb5zW9micqvqxHFcyhsRszg/viewform"
            target="_blank"
            rel="noreferrer"
          >
            {__('Contact with storepay')}
          </a>
        </SettingsContent>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
          >
            Cancel
          </Button>
          {renderButton({
            name: 'storepay',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default StorepayConfigForm;
