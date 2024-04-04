import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';

import { IPaymentDocument, IPocketConfig } from '../../types';
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
  pocketMerchant: string;

  pocketClientId: string;
  pocketClientSecret: string;
};

class PocketConfigForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { payment } = this.props;
    const { name = '', config } = payment || ({} as IPaymentDocument);
    const {
      pocketMerchant = '',
      pocketClientId = '',
      pocketClientSecret = ''
    } = config || ({} as IPocketConfig);

    this.state = {
      paymentName: name,
      pocketMerchant,
      pocketClientId,
      pocketClientSecret
    };
  }

  generateDoc = (values: {
    paymentName: string;
    pocketMerchant: string;
    pocketClientId: string;
    pocketClientSecret: string;
  }) => {
    const { payment } = this.props;
    const generatedValues = {
      name: values.paymentName,
      kind: PAYMENT_KINDS.POCKET,
      status: 'active',
      config: {
        pocketMerchant: values.pocketMerchant,
        pocketClientId: values.pocketClientId,
        pocketClientSecret: values.pocketClientSecret
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
      pocketMerchant,
      pocketClientId,
      pocketClientSecret
    } = this.state;

    const values = {
      paymentName,
      pocketMerchant,
      pocketClientId,
      pocketClientSecret
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {this.renderItem('paymentName', 'Name')}
          {this.renderItem('pocketMerchant', 'Merchant')}
          {this.renderItem('pocketClientId', 'Client ID')}
          {this.renderItem('pocketClientSecret', 'Client secret', '', true)}

          <a href="https://pocket.mn/" target="_blank" rel="noreferrer">
            {__('Go to website pocket')}
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
            name: 'pocket',
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

export default PocketConfigForm;
