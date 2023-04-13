import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __, getEnv } from '@erxes/ui/src/utils';
import React from 'react';
import { IPaymentDocument, ISocialPayConfig } from '../../types';

import { PAYMENT_KINDS } from '../constants';
import { SettingsContent } from './styles';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  payment?: IPaymentDocument;
};

type State = {
  paymentName: string;
  inStoreSPTerminal: string;
  inStoreSPKey: string;
};

class SocialPayConfigForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { payment } = this.props;
    const { name, config } = payment || ({} as IPaymentDocument);
    const { inStoreSPTerminal, inStoreSPKey } =
      config || ({} as ISocialPayConfig);

    this.state = {
      paymentName: name || '',
      inStoreSPTerminal: inStoreSPTerminal || '',
      inStoreSPKey: inStoreSPKey || ''
    };
  }

  generateDoc = (values: {
    paymentName: string;
    inStoreSPTerminal: string;
    inStoreSPKey: string;
  }) => {
    const { payment } = this.props;
    const generatedValues = {
      name: values.paymentName,
      kind: PAYMENT_KINDS.SOCIALPAY,
      status: 'active',
      config: {
        inStoreSPTerminal: values.inStoreSPTerminal,
        inStoreSPKey: values.inStoreSPKey
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
    const value =
      key === 'pushNotification'
        ? `${getEnv().REACT_APP_API_URL}/pl:payment/callback/socialpay`
        : this.state[key];

    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        {description && <p>{description}</p>}
        <FormControl
          defaultValue={value}
          onChange={this.onChangeConfig.bind(this, key)}
          value={value}
          disabled={key === 'pushNotification'}
          type={isPassword ? 'password' : ''}
        />
      </FormGroup>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = this.props;
    const { isSubmitted } = formProps;
    const { paymentName, inStoreSPTerminal, inStoreSPKey } = this.state;

    const values = {
      paymentName,
      inStoreSPTerminal,
      inStoreSPKey
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {this.renderItem('paymentName', 'Name')}
          {this.renderItem('inStoreSPTerminal', 'Terminal')}
          {this.renderItem('inStoreSPKey', 'Key', '', true)}
          {this.renderItem(
            'pushNotification',
            'Notification URL',
            'Register following URL in Golomt Bank'
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
            name: 'socialpay',
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
