import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { IPaymentDocument, IQpayConfig } from '../../types';

import { PAYMENT_KINDS } from '../constants';
import { SettingsContent } from './styles';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  isWechatpay?: boolean;
  payment?: IPaymentDocument;
  metaData?: any;
};

type State = {
  paymentName: string;
  qpayMerchantUser: string;
  qpayMerchantPassword: string;
  qpayInvoiceCode: string;
};

class QpayConfigForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { payment } = this.props;
    const { name, config } = payment || ({} as IPaymentDocument);

    const { qpayMerchantUser, qpayMerchantPassword, qpayInvoiceCode } =
      config || ({} as IQpayConfig);

    this.state = {
      paymentName: name || '',
      qpayMerchantUser: qpayMerchantUser || '',
      qpayMerchantPassword: qpayMerchantPassword || '',
      qpayInvoiceCode: qpayInvoiceCode || ''
    };
  }

  generateDoc = (values: {
    paymentName: string;
    qpayMerchantUser: string;
    qpayMerchantPassword: string;
    qpayInvoiceCode: string;
  }) => {
    const { payment } = this.props;
    const generatedValues = {
      name: values.paymentName,
      kind: this.props.isWechatpay
        ? PAYMENT_KINDS.WECHATPAY
        : PAYMENT_KINDS.QPAY,
      status: 'active',
      config: {
        qpayMerchantUser: values.qpayMerchantUser,
        qpayMerchantPassword: values.qpayMerchantPassword,
        qpayInvoiceCode: values.qpayInvoiceCode
      }
    };

    return payment ? { id: payment._id, ...generatedValues } : generatedValues;
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
      qpayMerchantUser,
      qpayMerchantPassword,
      qpayInvoiceCode
    } = this.state;

    const values = {
      paymentName,
      qpayMerchantUser,
      qpayMerchantPassword,
      qpayInvoiceCode
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {this.renderItem('paymentName', 'Name')}
          {this.renderItem('qpayMerchantUser', 'Username')}
          {this.renderItem('qpayMerchantPassword', 'Password', '', true)}
          {this.renderItem('qpayInvoiceCode', 'Invoice code')}

          {this.props.metaData.link && (
            <a href={this.props.metaData.link} target="_blank" rel="noreferrer">
              {__('Apply for a QPay')}
            </a>
          )}
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
            passedName: 'payment',
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
