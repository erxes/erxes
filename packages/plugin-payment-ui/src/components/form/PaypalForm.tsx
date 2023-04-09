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
import React from 'react';

import { IPaypalConfig, IPaymentDocument } from '../../types';
import { PAYMENT_KINDS } from '../constants';
import { SettingsContent, ToggleWrapper } from './styles';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  payment?: IPaymentDocument;
};

type State = {
  paymentName: string;
  paypalMode: 'sandbox' | 'live';
  paypalClientId: string;
  paypalClientSecret: string;
};

class PaypalConfigForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { payment } = this.props;
    const { name = '', config } = payment || ({} as IPaymentDocument);
    const paypal = config || ({} as IPaypalConfig);

    this.state = {
      paymentName: name,
      paypalMode: paypal.mode || 'sandbox',
      paypalClientId: paypal.clientId || '',
      paypalClientSecret: paypal.clientSecret || ''
    };
  }

  generateDoc = (values: {
    paymentName: string;
    paypalClientId: string;
    paypalClientSecret: string;
    paypalMode: 'sandbox' | 'live';
  }) => {
    const { payment } = this.props;
    const generatedValues = {
      name: values.paymentName,
      kind: PAYMENT_KINDS.PAYPAL,
      status: 'active',
      config: {
        paypalClientId: values.paypalClientId,
        paypalClientSecret: values.paypalClientSecret,
        paypalMode: values.paypalMode
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
      paypalClientId,
      paypalClientSecret,
      paypalMode
    } = this.state;

    const values = {
      paymentName,
      paypalClientId,
      paypalClientSecret,
      paypalMode
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {this.renderItem('paymentName', 'Name')}
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

          {this.renderItem('paypalClientId', 'Client ID')}
          {this.renderItem('paypalClientSecret', 'Client Secret', '', true)}
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
            name: 'paypal',
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

export default PaypalConfigForm;
