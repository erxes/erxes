import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';

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

const PocketConfigForm: React.FC<Props> = (props) => {
  const { payment } = props;
  const { name = '', config } = payment || ({} as IPaymentDocument);
  const {
    pocketMerchant = '',
    pocketClientId = '',
    pocketClientSecret = '',
  } = config || ({} as IPocketConfig);

  const [state, setState] = useState<State>({
    paymentName: name,
    pocketMerchant,
    pocketClientId,
    pocketClientSecret,
  });

  const generateDoc = (values: {
    paymentName: string;
    pocketMerchant: string;
    pocketClientId: string;
    pocketClientSecret: string;
  }) => {
    const { payment } = props;
    const generatedValues = {
      name: values.paymentName,
      kind: PAYMENT_KINDS.POCKET,
      status: 'active',
      config: {
        pocketMerchant: values.pocketMerchant,
        pocketClientId: values.pocketClientId,
        pocketClientSecret: values.pocketClientSecret,
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
    const { paymentName, pocketMerchant, pocketClientId, pocketClientSecret } =
      state;

    const values = {
      paymentName,
      pocketMerchant,
      pocketClientId,
      pocketClientSecret,
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {renderItem('paymentName', 'Name')}
          {renderItem('pocketMerchant', 'Merchant')}
          {renderItem('pocketClientId', 'Client ID')}
          {renderItem('pocketClientSecret', 'Client secret', '', true)}

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
            passedName: 'pocket',
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

export default PocketConfigForm;
