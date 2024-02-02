import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';

import { IPaymentDocument, IStorepayConfig } from '../../types';
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
  merchantUsername: string;
  merchantPassword: string;

  appUsername: string;
  appPassword: string;

  storeId: string;
};

const StorepayConfigForm: React.FC<Props> = (props) => {
  const { payment } = props;
  const { name = '', config } = payment || ({} as IPaymentDocument);
  const {
    storeId,
    merchantPassword,
    merchantUsername,
    appUsername,
    appPassword,
  } = config || ({} as IStorepayConfig);

  const [state, setState] = useState<State>({
    paymentName: name,
    storeId,
    merchantPassword,
    merchantUsername,
    appUsername,
    appPassword,
  });

  const generateDoc = (values: {
    paymentName: string;
    storeId: string;
    merchantPassword: string;
    merchantUsername: string;
    appUsername: string;
    appPassword: string;
  }) => {
    const { payment } = props;
    const generatedValues = {
      name: values.paymentName,
      kind: PAYMENT_KINDS.STOREPAY,
      status: 'active',
      config: {
        storeId: values.storeId,
        merchantPassword: values.merchantPassword,
        merchantUsername: values.merchantUsername,
        appUsername: values.appUsername,
        appPassword: values.appPassword,
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
    const {
      paymentName,
      storeId,
      merchantPassword,
      merchantUsername,
      appUsername,
      appPassword,
    } = state;

    const values = {
      paymentName,
      storeId,
      merchantPassword,
      merchantUsername,
      appUsername,
      appPassword,
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {renderItem('paymentName', 'Name')}
          {renderItem('storeId', 'Store id')}
          {renderItem('merchantUsername', 'Merchant username')}
          {renderItem('merchantPassword', 'Merchant password', '', true)}
          {renderItem('appUsername', 'App username')}
          {renderItem('appPassword', 'App password', '', true)}

          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScxZItJ5egDhNqSOMTj6np6d9yrb5zW9micqvqxHFcyhsRszg/viewform"
            target="_blank"
            rel="noreferrer"
          >
            {__('Contact with storepay')}
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
            passedName: 'storepay',
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

export default StorepayConfigForm;
