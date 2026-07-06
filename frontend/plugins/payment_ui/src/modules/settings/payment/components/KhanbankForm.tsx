import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { Input, Select, Spinner } from 'erxes-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';

import { IPaymentDocument } from '../../../payment/types/Payment';

const CONFIGS_QUERY = gql`
  query KhanbankConfigs($page: Int, $perPage: Int) {
    khanbankConfigs(page: $page, perPage: $perPage) {
     list {
        _id
        name
      }
    }
  }
`;

const ACCOUNTS_QUERY = gql`
  query KhanbankAccounts($configId: String!) {
    khanbankAccounts(configId: $configId) {
      name
      number
      ibanAcctNo
      currency
    }
  }
`;

type Props = {
  payment?: IPaymentDocument;
  form: UseFormReturn<any>;
  Form: typeof import('erxes-ui/components/form').Form;
};

const KhanbankForm: React.FC<Props> = ({ payment, form, Form }) => {
  const { t } = useTranslation('payment');

  const { register, watch, setValue, control } = form;

  const configId = watch('configId');
  const accountNumber = watch('accountNumber');

  const { loading, data } = useQuery(CONFIGS_QUERY, {
    variables: { page: 1, perPage: 999 },
  });

  const [loadAccounts, { data: accountsData, loading: accountsLoading }] =
    useLazyQuery(ACCOUNTS_QUERY, {
      fetchPolicy: 'network-only',
    });

  React.useEffect(() => {
    if (!payment?.config) return;

    Object.entries(payment.config).forEach(([key, value]) => {
      if (value !== undefined) {
        setValue(key, value);
      }
    });
  }, [payment, setValue]);

  React.useEffect(() => {
    if (configId) {
      loadAccounts({
        variables: { configId },
      });
    }
  }, [configId, loadAccounts]);

  if (loading) {
    return <Spinner />;
  }

  const configs = data?.khanbankConfigsList?.list ?? [];
  const accounts = accountsData?.khanbankAccounts || [];

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <Form.Item>
        <Form.Label>{t('name')} *</Form.Label>
        <Form.Control>
          <Input
            {...register('name', {
              required: true,
            })}
          />
        </Form.Control>
      </Form.Item>

      <Form.Field
        name="configId"
        control={control}
        render={({ field }: any) => (
          <Form.Item>
            <Form.Label>{t('config')} *</Form.Label>
            <Form.Control>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <Select.Trigger>
                  <Select.Value placeholder={t('select-config')} />
                </Select.Trigger>

                <Select.Content>
                  <Select.Group>
                    {configs.map((config: any) => (
                      <Select.Item
                        key={config._id}
                        value={config._id}
                      >
                        {config.name}
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select>
            </Form.Control>
          </Form.Item>
        )}
      />

      {configId && (
        <Form.Field
          name="accountNumber"
          control={control}
          render={({ field }: any) => (
            <Form.Item>
              <Form.Label>{t('account')} *</Form.Label>

              <Form.Control>
                {accountsLoading ? (
                  <Spinner />
                ) : (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);

                      const account = accounts.find(
                        (a: any) => a.number === value
                      );

                      if (account) {
                        setValue('ibanAcctNo', account.ibanAcctNo);
                      }
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder={t('select-account')} />
                    </Select.Trigger>

                    <Select.Content>
                      <Select.Group>
                        {accounts.map((account: any) => (
                          <Select.Item
                            key={account.number}
                            value={account.number}
                          >
                            {account.name} - {account.ibanAcctNo}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select>
                )}
              </Form.Control>
            </Form.Item>
          )}
        />
      )}

      <input
        type="hidden"
        {...register('ibanAcctNo')}
      />

      <div className="col-span-2">
        <a
          href="https://www.khanbank.com/business/product/detail/business-corporate-gateway/"
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:underline"
        >
          {t('more-info')}
        </a>
      </div>
    </div>
  );
};

export default KhanbankForm;