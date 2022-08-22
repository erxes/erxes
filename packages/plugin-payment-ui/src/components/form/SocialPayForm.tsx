import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';

import Button from '@erxes/ui/src/components/Button';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';

import { __ } from '@erxes/ui/src/utils';
import { SettingsContent } from './styles';
import { IPaymentConfig } from 'types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  paymentConfig?: IPaymentConfig;
};

type State = {
  paymentConfigName: string;
  inStoreSPTerminal: string;
  inStoreSPKey: string;
  inStoreSPUrl: string;
  pushNotification: string;
};

class SocialPayConfigForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { paymentConfig } = this.props;

    this.state = {
      paymentConfigName: paymentConfig?.name || '',
      inStoreSPTerminal: paymentConfig?.config.terminal || '',
      inStoreSPKey: paymentConfig?.config.spKey || '',
      inStoreSPUrl: paymentConfig?.config.spUrl || '',
      pushNotification: paymentConfig?.config.spNotif || ''
    };
  }

  generateDoc = (values: {
    paymentConfigName: string;
    inStoreSPTerminal: string;
    inStoreSPKey: string;
    inStoreSPUrl: string;
    pushNotification: string;
  }) => {
    console.log('generateDoc values:', values);

    return {
      name: values.paymentConfigName,
      type: 'socialPay',
      status: 'active',
      config: {
        terminal: values.inStoreSPTerminal,
        spKey: values.inStoreSPKey,
        spUrl: values.inStoreSPUrl,
        spNotif: values.pushNotification
      }
    };
  };

  onChangeConfig = (code: string, e) => {
    this.setState({ [code]: e.target.value } as any);
  };

  renderItem = (key: string, title: string, description?: string) => {
    const value = this.state[key]
      ? this.state[key]
      : key === 'inStoreSPUrl'
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
      inStoreSPTerminal,
      inStoreSPKey,
      inStoreSPUrl,
      pushNotification
    } = this.state;

    const values = {
      paymentConfigName,
      inStoreSPTerminal,
      inStoreSPKey,
      inStoreSPUrl,
      pushNotification
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {this.renderItem('paymentConfigName', 'Name')}
          {this.renderItem('inStoreSPTerminal', 'Terminal')}
          {this.renderItem('inStoreSPKey', 'Key')}
          {this.renderItem('inStoreSPUrl', 'InStore SocialPay url')}
          {this.renderItem(
            'pushNotification',
            'Push notification url with /pushNotif'
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
            name: 'socialPay',
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

export default SocialPayConfigForm;
