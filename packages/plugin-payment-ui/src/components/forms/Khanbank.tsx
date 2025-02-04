import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';

import { IPaymentDocument } from '../../types';
import { SettingsContent } from './styles';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  payment?: IPaymentDocument;
  accounts: any[];
  configs: any[];
  onSelectConfig: (id: string) => void;
};

type State = {
  paymentName: string;
  configMap: any;
};

const ConfigForm: React.FC<Props> = ({
  renderButton,
  closeModal,
  payment,
  configs,
  accounts,
  onSelectConfig,
}) => {
  const { name = '', config = {} } = payment || ({} as IPaymentDocument);

  const [state, setState] = useState<State>({
    paymentName: name,
    configMap: config,
  });

  const generateDoc = (values: { paymentName: string; configMap: any }) => {
    const generatedValues = {
      name: values.paymentName,
      kind: 'khanbank',
      status: 'active',
      config: values.configMap,
    };

    return payment ? { ...generatedValues, id: payment._id } : generatedValues;
  };

  const onChangeConfig = (
    code: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (code === 'paymentName') {
      return setState((prevState) => ({
        ...prevState,
        paymentName: e.target.value,
      }));
    }

    setState((prevState) => ({
      ...prevState,
      configMap: {
        ...prevState.configMap,
        [code]: e.target.value,
      },
    }));
  };

  const renderItem = (
    key: string,
    title: string,
    type?: string,
    description?: string
  ) => {
    let value;

    if (key === 'paymentName') {
      value = state[key as keyof State];
    } else {
      value = state.configMap[key];
    }
    return (
      <FormGroup key={key}>
        <ControlLabel>{title}</ControlLabel>
        {description && <p>{description}</p>}
        <FormControl
          defaultValue={value}
          onChange={(e: any) => onChangeConfig(key, e)}
          value={value}
          type={type || 'text'}
        />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted } = formProps;
    const { paymentName } = state;

    const values = {
      paymentName,
      configMap: state.configMap,
    };

    return (
      <>
        <SettingsContent title={__('General settings')}>
          {renderItem('paymentName', 'Name', 'text')}


          <FormGroup>
            <ControlLabel required={true}>Config</ControlLabel>
            <FormControl
              {...formProps}
              id='config'
              name='config'
              componentclass='select'
              required={true}
              defaultValue={state.configMap.configId}
              onChange={(e: any) => (
                onSelectConfig(e.target.value),
                setState((prevState) => ({
                  ...prevState,
                  configMap: {
                    ...prevState.configMap,
                    configId: e.target.value,
                    accountNumber: '',
                  },
                }))
              )}
              errors={formProps.errors}
            >
              <option value=''>
                {__('Select a Corporate gateway config')}
              </option>
              {configs.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          {state.configMap.configId && (
            <FormGroup>
              <ControlLabel required={true}>Account</ControlLabel>
              <FormControl
                {...formProps}
                id='accountSelect'
                name='accountNumber'
                componentclass='select'
                required={true}
                defaultValue={state.configMap.accountNumber}
                onChange={(e: any) =>
                  setState((prevState) => ({
                    ...prevState,
                    configMap: {
                      ...prevState.configMap,
                      accountNumber: e.target.value,
                    },
                  }))
                }
                errors={formProps.errors}
              >
                <option value=''>{__('Select a Account')}</option>
                {accounts.map((c) => (
                  <option key={c.number} value={c.number}>
                    {`${c.name} - ${c.number}`}
                  </option>
                ))}
              </FormControl>
            </FormGroup>
          )}

          <a
            href={
              'https://www.khanbank.com/business/product/detail/business-corporate-gateway/'
            }
            target='_blank'
            rel='noreferrer'
          >
            {__('more info')}
          </a>
        </SettingsContent>

        <ModalFooter>
          <Button
            btnStyle='simple'
            type='button'
            onClick={closeModal}
            icon='times-circle'
          >
            Cancel
          </Button>
          {renderButton({
            passedName: 'payment',
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

export default ConfigForm;
