import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
// import SelectBrand from '../../containers/SelectBrand';
// import SelectChannels from '../../containers/SelectChannels';
import { __ } from '@erxes/ui/src/utils';
import { SettingsContent } from './styles';
import { IPaymentConfig } from 'types';

// {this.renderItem('paymentConfigName', 'Name')}
//           {this.renderItem('qpayMerchantUser', 'Username')}
//           {this.renderItem('qpayMerchantPassword', 'Password')}
//           {this.renderItem('qpayInvoiceCode', 'Invoice code')}
//           {this.renderItem('qpayUrl', 'Qpay url')}
//           {this.renderItem('callbackUrl', 'Call back url with /payments')}

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  paymentConfig?: IPaymentConfig;
};

type State = {
  paymentConfigName: string;
  qpayMerchantUser: string;
  qpayMerchantPassword: string;
  qpayInvoiceCode: string;
  qpayUrl: string;
  callbackUrl: string;
};

class QpayConfigForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { paymentConfig } = this.props;

    this.state = {
      paymentConfigName: paymentConfig?.name || '',
      qpayMerchantUser: paymentConfig?.config.terminal || '',
      qpayMerchantPassword: paymentConfig?.config.spKey || '',
      qpayInvoiceCode: paymentConfig?.config.spUrl || '',
      qpayUrl: paymentConfig?.config.spNotif || '',
      callbackUrl: paymentConfig?.config.spNotif || ''
    };
  }

  generateDoc = (values: {
    paymentConfigName: string;
    qpayMerchantUser: string;
    qpayMerchantPassword: string;
    qpayInvoiceCode: string;
    qpayUrl: string;
    callbackUrl: string;
  }) => {
    console.log('generateDoc values:', values);

    return {
      name: values.paymentConfigName,
      type: 'qpay',
      status: 'active',
      config: {
        user: values.qpayMerchantUser,
        password: values.qpayMerchantPassword,
        invoiceCode: values.qpayInvoiceCode,
        qpUrl: values.qpayUrl,
        qpCallBack: values.callbackUrl
      }
    };
  };

  onChangeConfig = (code: string, e) => {
    this.setState({ [code]: e.target.value } as any);
  };

  renderItem = (key: string, title: string, description?: string) => {
    const value = this.state[key]
      ? this.state[key]
      : key === 'qpayUrl'
      ? 'https://merchant.qpay.mn'
      : '';
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
      qpayInvoiceCode,
      qpayUrl,
      callbackUrl
    } = this.state;

    const values = {
      paymentConfigName,
      qpayMerchantUser,
      qpayMerchantPassword,
      qpayInvoiceCode,
      qpayUrl,
      callbackUrl
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {this.renderItem('paymentConfigName', 'Name')}
          {this.renderItem('qpayMerchantUser', 'Username')}
          {this.renderItem('qpayMerchantPassword', 'Password')}
          {this.renderItem('qpayInvoiceCode', 'Invoice code')}
          {this.renderItem('qpayUrl', 'Qpay url')}
          {this.renderItem('callbackUrl', 'Call back url with /payments')}
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
