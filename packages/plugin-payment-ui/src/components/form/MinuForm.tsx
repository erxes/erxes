import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';

import { IPaymentDocument } from '../../types';
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
  username: string;
  password: string;
};

class MinuForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const { payment } = this.props;
    const { name = '', config } = payment || ({} as IPaymentDocument);
    const { username = '', password = '' } = config || ({} as any);

    this.state = {
      paymentName: name,
      username,
      password,
    };
  }

  generateDoc = (values: {
    paymentName: string;
    username: string;
    password: string;
  }) => {
    const { payment } = this.props;
    const generatedValues = {
      name: values.paymentName,
      kind: PAYMENT_KINDS.MINUPAY,
      status: 'active',
      config: {
        username: values.username,
        password: values.password,
      },
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
    isPassword?: boolean,
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
    const { paymentName, password, username } = this.state;

    const values = {
      paymentName,
      password,
      username,
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {this.renderItem('paymentName', 'Name')}
          {this.renderItem('username', 'Username', '', false)}
          {this.renderItem('password', 'Password', '', true)}

          {this.props.metaData && this.props.metaData.link && (
            <a href={this.props.metaData.link} target="_blank" rel="noreferrer">
              {__('Contact with Monpay')}
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
            name: 'minupay',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal,
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default MinuForm;
