import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __, getEnv } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
import { IPaymentDocument, ISocialPayConfig } from '../../types';

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
  inStoreSPTerminal: string;
  inStoreSPKey: string;
};

const SocialPayConfigForm: React.FC<Props> = (props) => {
  const { payment } = props;
  const { name, config } = payment || ({} as IPaymentDocument);
  const { inStoreSPTerminal, inStoreSPKey } =
    config || ({} as ISocialPayConfig);

  const [state, setState] = useState<State>({
    paymentName: name || '',
    inStoreSPTerminal: inStoreSPTerminal || '',
    inStoreSPKey: inStoreSPKey || '',
  });

  const generateDoc = (values: {
    paymentName: string;
    inStoreSPTerminal: string;
    inStoreSPKey: string;
  }) => {
    const { payment } = props;
    const generatedValues = {
      name: values.paymentName,
      kind: PAYMENT_KINDS.SOCIALPAY,
      status: 'active',
      config: {
        inStoreSPTerminal: values.inStoreSPTerminal,
        inStoreSPKey: values.inStoreSPKey,
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
    const value =
      key === 'pushNotification'
        ? `${getEnv().REACT_APP_API_URL}/pl:payment/callback/socialpay`
        : state[key];

    return (
      <FormGroup>
        <ControlLabel>{title}</ControlLabel>
        {description && <p>{description}</p>}
        <FormControl
          defaultValue={value}
          onChange={onChangeConfig.bind(this, key)}
          value={value}
          disabled={key === 'pushNotification'}
          type={isPassword ? 'password' : ''}
        />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { renderButton, closeModal } = props;
    const { isSubmitted } = formProps;
    const { paymentName, inStoreSPTerminal, inStoreSPKey } = state;

    const values = {
      paymentName,
      inStoreSPTerminal,
      inStoreSPKey,
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {renderItem('paymentName', 'Name')}
          {renderItem('inStoreSPTerminal', 'Terminal')}
          {renderItem('inStoreSPKey', 'Key', '', true)}
          {renderItem(
            'pushNotification',
            'Notification URL',
            'Register following URL in Golomt Bank',
          )}

          <a
            href="https://www.golomtbank.com/corporate/digital-bank/socialpay2"
            target="_blank"
            rel="noreferrer"
          >
            {__('more about SocialPay')}
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
            passedName: 'socialpay',
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

export default SocialPayConfigForm;
