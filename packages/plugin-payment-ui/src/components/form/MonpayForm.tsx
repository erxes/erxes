import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';

import { IMonpayConfig, IPaymentDocument } from '../../types';
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
  accountId: string;
};

const MonpayConfigForm: React.FC<Props> = (props) => {
  const { payment, renderButton, closeModal } = props;
  const { name = '', config } = payment || ({} as IPaymentDocument);
  const { username = '', accountId = '' } = config || ({} as IMonpayConfig);

  const [state, setState] = useState<State>({
    paymentName: name,
    username,
    accountId,
  });

  const generateDoc = (values: {
    paymentName: string;
    username: string;
    accountId: string;
  }) => {
    const generatedValues = {
      name: values.paymentName,
      kind: PAYMENT_KINDS.MONPAY,
      status: 'active',
      config: {
        username: values.username,
        accountId: values.accountId,
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
          onChange={(e) => onChangeConfig(key, e)}
          value={value}
          type={isPassword ? 'password' : ''}
        />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted } = formProps;
    const { paymentName, accountId, username } = state;

    const values = {
      paymentName,
      accountId,
      username,
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {renderItem('paymentName', 'Name')}
          {renderItem('username', 'Branch username')}
          {renderItem('accountId', 'Account ID', '', true)}

          {props.metaData && props.metaData.link && (
            <a href={props.metaData.link} target="_blank" rel="noreferrer">
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
            passedName: 'monpay',
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

export default MonpayConfigForm;
