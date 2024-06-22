import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { Formgroup } from '@erxes/ui/src/components/form/styles';
import Toggle from '@erxes/ui/src/components/Toggle';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';

import { IPaypalConfig, IPaymentDocument } from '../../types';
import { PAYMENT_KINDS } from '../constants';
import { SettingsContent, ToggleWrapper } from './styles';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  payment?: IPaymentDocument;
  metaData?: any;
};

type State = {
  paymentName: string;
  paypalMode: 'sandbox' | 'live';
  paypalClientId: string;
  paypalClientSecret: string;
};

const PaypalConfigForm: React.FC<Props> = (props) => {
  const { payment } = props;
  const { name = '', config } = payment || ({} as IPaymentDocument);
  const paypal = config || ({} as IPaypalConfig);

  const [state, setState] = useState<State>({
    paymentName: name,
    paypalMode: paypal.mode || 'sandbox',
    paypalClientId: paypal.clientId || '',
    paypalClientSecret: paypal.clientSecret || '',
  });

  const generateDoc = (values: {
    paymentName: string;
    paypalClientId: string;
    paypalClientSecret: string;
    paypalMode: 'sandbox' | 'live';
  }) => {
    const { payment } = props;
    const generatedValues = {
      name: values.paymentName,
      kind: PAYMENT_KINDS.PAYPAL,
      status: 'active',
      config: {
        paypalClientId: values.paypalClientId,
        paypalClientSecret: values.paypalClientSecret,
        paypalMode: values.paypalMode,
      },
    };

    return payment ? { ...generatedValues, id: payment._id } : generatedValues;
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
    const { paymentName, paypalClientId, paypalClientSecret, paypalMode } =
      state;

    const values = {
      paymentName,
      paypalClientId,
      paypalClientSecret,
      paypalMode,
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {renderItem('paymentName', 'Name')}
          <Formgroup>
            <ControlLabel>Mode</ControlLabel>
            <ToggleWrapper>
              <span className={paypalMode === 'live' ? 'active' : ''}>
                {__('Sandbox')}
              </span>
              <Toggle defaultChecked={paypalMode === 'live'} />
              <span className={paypalMode !== 'live' ? 'active' : ''}>
                {__('Live')}
              </span>
            </ToggleWrapper>
          </Formgroup>

          {renderItem('paypalClientId', 'Client ID')}
          {renderItem('paypalClientSecret', 'Client Secret', '', true)}
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
            passedName: 'paypal',
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

export default PaypalConfigForm;
