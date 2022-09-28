import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { IPaymentConfigDocument, IQpayConfig } from 'types';

import { SettingsContent } from './styles';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  paymentConfig?: IPaymentConfigDocument;
};

type State = {
  paymentConfigName: string;
  qpayMerchantUser: string;
  qpayMerchantPassword: string;
  qpayInvoiceCode: string;
};

class QpayConfigForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { paymentConfig } = this.props;
    const { name, config } = paymentConfig || ({} as IPaymentConfigDocument);
    console.log(name, config);
    const { qpayMerchantUser, qpayMerchantPassword, qpayInvoiceCode } =
      config || ({} as IQpayConfig);

    this.state = {
      paymentConfigName: name || '',
      qpayMerchantUser: qpayMerchantUser || '',
      qpayMerchantPassword: qpayMerchantPassword || '',
      qpayInvoiceCode: qpayInvoiceCode || ''
    };
  }

  generateDoc = (values: {
    paymentConfigName: string;
    qpayMerchantUser: string;
    qpayMerchantPassword: string;
    qpayInvoiceCode: string;
  }) => {
    const { paymentConfig } = this.props;
    const generatedValues = {
      name: values.paymentConfigName,
      type: 'qpay',
      status: 'active',
      config: {
        qpayMerchantUser: values.qpayMerchantUser,
        qpayMerchantPassword: values.qpayMerchantPassword,
        qpayInvoiceCode: values.qpayInvoiceCode
      }
    };

    return paymentConfig
      ? { id: paymentConfig._id, ...generatedValues }
      : generatedValues;
  };

  onChangeConfig = (code: string, e) => {
    this.setState({ [code]: e.target.value } as any);
  };

  renderItem = (key: string, title: string, description?: string) => {
    const value = this.state[key] || '';
    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        <FormControl
          defaultValue={value}
          onChange={this.onChangeConfig.bind(this, key)}
          value={value}
        />
      </FormGroup>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { isSubmitted } = formProps;

    const {
      paymentConfigName,
      qpayMerchantUser,
      qpayMerchantPassword,
      qpayInvoiceCode
    } = this.state;

    const values = {
      paymentConfigName,
      qpayMerchantUser,
      qpayMerchantPassword,
      qpayInvoiceCode
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {this.renderItem('paymentConfigName', 'Name')}
          {this.renderItem('qpayMerchantUser', 'Username')}
          {this.renderItem('qpayMerchantPassword', 'Password')}
          {this.renderItem('qpayInvoiceCode', 'Invoice code')}
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
            name: 'integration',
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

export default QpayConfigForm;
