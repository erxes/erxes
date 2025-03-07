import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React, { useState } from 'react';

import { gql, useLazyQuery, useQuery } from '@apollo/client';
import Spinner from '@erxes/ui/src/components/Spinner';
import { IPaymentDocument } from '../../types';
import { SettingsContent } from './styles';

const CONFIGS_QUERY = gql`
  query KhanbankConfigs($page: Int, $perPage: Int) {
    khanbankConfigs(page: $page, perPage: $perPage) {
      _id
      name
    }
  }
`;

const ACCOUNTS_QUERY = gql`
  query KhanbankAccounts($configId: String!) {
    khanbankAccounts(configId: $configId) {
      name
      number
      currency
    }
  }
`;

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

const ConfigForm: React.FC<Props> = ({ renderButton, closeModal, payment }) => {
  const { loading, error, data } = useQuery(CONFIGS_QUERY, {
    variables: { page: 1, perPage: 999 },
  });

  const [getAccounts, { data: accountsData, loading: accountsLoading }] =
    useLazyQuery(ACCOUNTS_QUERY, {
      fetchPolicy: 'network-only',
    });

  const [paymentName, setPaymentName] = useState(payment?.name || '');
  const [configId, setConfigId] = useState(payment?.config?.configId || '');
  const [accountNumber, setAccountNumber] = useState(
    payment?.config?.accountNumber || ''
  );

  React.useEffect(() => {
    if (configId) {
      getAccounts({ variables: { configId } });
    }
  }, [configId, getAccounts]);

  if (loading) {
    return <Spinner />;
  }

  const configs = data?.khanbankConfigs || [];
  const accounts = accountsData?.khanbankAccounts || [];

  // React.useEffect(() => {
  //   if (payment) {
  //     setPaymentName(payment.name);
  //     setConfigId(payment.config?.configId || '');
  //     setAccountNumber(payment.config?.accountNumber || '');
  //   }
  // }, [payment]);

  const generateDoc = () => {
    const generatedValues = {
      name: paymentName,
      kind: 'khanbank',
      status: 'active',
      config: {
        configId,
        accountNumber,
      },
    };

    return payment ? { ...generatedValues, id: payment._id } : generatedValues;
  };

  const renderAccounts = (formProps) => {
    if (!configId || configId.length === 0) {
      return null;
    }

    return (
      <FormGroup>
        <ControlLabel required={true}>Account</ControlLabel>
        {accountsLoading ? (
          <Spinner />
        ) : (
          <FormControl
            {...formProps}
            id='accountSelect'
            name='accountNumber'
            componentclass='select'
            required={true}
            defaultValue={accountNumber}
            onChange={(e: any) => setAccountNumber(e.target.value)}
            errors={formProps.errors}
          >
            <option value=''>{__('Select a Account')}</option>
            {accounts.map((c) => (
              <option key={c.number} value={c.number}>
                {`${c.name} - ${c.number}`}
              </option>
            ))}
          </FormControl>
        )}
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { isSubmitted } = formProps;

    return (
      <>
        <SettingsContent title={__('General settings')}>
          <FormGroup>
            <ControlLabel>{__('Name')}</ControlLabel>

            <FormControl
              defaultValue={paymentName}
              onChange={(e: any) => setPaymentName(e.target.value)}
              value={paymentName}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel required={true}>Config</ControlLabel>
            <FormControl
              {...formProps}
              id='config'
              name='config'
              componentclass='select'
              required={true}
              // defaultValue={configId}
              value={configId}
              onChange={(e: any) => {
                const selectedConfigId = e.target.value;
  
                setConfigId(selectedConfigId);
              }}
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

          {renderAccounts(formProps)}

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
            values: generateDoc(),
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
