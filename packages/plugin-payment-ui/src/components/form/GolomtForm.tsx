import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __, getEnv } from '@erxes/ui/src/utils';
import React, { useState } from 'react';
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
  merchant: string;
  key: string;
  token: string;
};

const GolomtConfigForm: React.FC<Props> = (props) => {
  const { payment } = props;
  const { name, config } = payment || ({} as IPaymentDocument);
  const { merchant = '', key = '', token = '' } = config || ({} as any);

  const [state, setState] = useState<State>({
    paymentName: name || '',
    merchant,
    key,
    token,
  });

  const generateDoc = (values: {
    paymentName: string;
    merchant: string;
    key: string;
    token: string;
  }) => {
    const { payment } = props;
    const generatedValues = {
      name: values.paymentName,
      kind: PAYMENT_KINDS.GOLOMT,
      status: 'active',
      config: {
        ...values,
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
        ? `${getEnv().REACT_APP_API_URL}/pl:payment/callback/golomt`
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
    const { paymentName, merchant, key, token } = state;

    const values = {
      paymentName,
      merchant,
      key,
      token,
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {renderItem('paymentName', 'Name')}
          {renderItem('merchant', 'Merchant')}
          {renderItem('key', 'Key')}
          {renderItem('token', 'Token', '', true)}
          {renderItem(
            'pushNotification',
            'Notification URL',
            'Register following URL in Golomt Bank',
          )}

          <a
            href="https://www.golomtbank.com/corporate/digital-bank/Golomt2"
            target="_blank"
            rel="noreferrer"
          >
            {__('more about Golomt')}
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
            passedName: 'Golomt',
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

export default GolomtConfigForm;
