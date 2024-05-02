import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
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

const QpayConfigForm: React.FC<Props> = (props) => {
  const { payment } = props;
  const { name, config } = payment || ({} as IPaymentDocument);

  const { qpayMerchantUser, qpayMerchantPassword, qpayInvoiceCode } =
    config || ({} as IQpayConfig);

  const [state, setState] = useState<State>({
    paymentName: name || '',
    qpayMerchantUser: qpayMerchantUser || '',
    qpayMerchantPassword: qpayMerchantPassword || '',
    qpayInvoiceCode: qpayInvoiceCode || '',
  });

  const generateDoc = (values: {
    paymentName: string;
    qpayMerchantUser: string;
    qpayMerchantPassword: string;
    qpayInvoiceCode: string;
  }) => {
    const { payment } = props;
    const generatedValues = {
      name: values.paymentName,
      kind: props.isWechatpay ? PAYMENT_KINDS.WECHATPAY : PAYMENT_KINDS.QPAY,
      status: 'active',
      config: {
        qpayMerchantUser: values.qpayMerchantUser,
        qpayMerchantPassword: values.qpayMerchantPassword,
        qpayInvoiceCode: values.qpayInvoiceCode,
      },
    };

    return payment ? { id: payment._id, ...generatedValues } : generatedValues;
  };

  const onChangeConfig = (code: string, e) => {
    setState((prevState) => ({ ...prevState, [code]: e.target.value }));
  };

  const renderItem = (
    key: string,
    title: string,
    description?: string,
    isPassword?: boolean,
  ) => {
    const value = state[key];

    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        {description && <p>{description}</p>}
        <FormControl
          defaultValue={value}
          onChange={onChangeConfig.bind(this, key)}
          value={value}
          type={isPassword ? 'password' : ''}
        />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = props;
    const { isSubmitted } = formProps;

    const {
      paymentName,
      qpayMerchantUser,
      qpayMerchantPassword,
      qpayInvoiceCode,
    } = state;

    const values = {
      paymentName,
      qpayMerchantUser,
      qpayMerchantPassword,
      qpayInvoiceCode,
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {renderItem('paymentName', 'Name')}
          {renderItem('qpayMerchantUser', 'Username')}
          {renderItem('qpayMerchantPassword', 'Password', '', true)}
          {renderItem('qpayInvoiceCode', 'Invoice code')}

          {props.metaData && props.metaData.link && (
            <a href={props.metaData.link} target="_blank" rel="noreferrer">
              {__('Contact with QPay')}
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
            values: generateDoc(values),
            isSubmitted,
            callback: closeModal,
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default QpayConfigForm;
