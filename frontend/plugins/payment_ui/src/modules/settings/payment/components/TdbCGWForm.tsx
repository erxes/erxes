import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { Form, Input, Select, Spinner } from 'erxes-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FieldValues, UseFormReturn } from 'react-hook-form';

import { IPaymentDocument } from '../../../payment/types/Payment';

const CONFIGS_QUERY = gql`
  query TdbConfigsList($page: Int, $perPage: Int) {
    tdbConfigsList(limit: $limit, cursor: $cursor) {
      list {
        _id
        name
      }
      totalCount
    }
  }
`;

const ACCOUNTS_QUERY = gql`
  query TdbAccounts($configId: String!) {
    tdbAccounts(configId: $configId) {
      success
      msg
      data {
        ACNTNO
        IBAN
        iban
        ACNTNAME
        CURCODE
      }
    }
  }
`;

type Props = {
  payment?: IPaymentDocument;
  form: UseFormReturn<FieldValues>;
};

const TdbCGWForm: React.FC<Props> = ({ payment, form }) => {
  const { t } = useTranslation('payment');

  const { register, setValue, control, watch } = form;

  const configId = watch('configId');

  const { loading, data } = useQuery(CONFIGS_QUERY, {
    variables: {
      limit: 100,
    },
  });

  const [loadAccounts, { loading: accountsLoading, data: accountsData }] =
    useLazyQuery(ACCOUNTS_QUERY);

  React.useEffect(() => {
    if (!payment?.config) return;

    Object.entries(payment.config).forEach(([key, value]) => {
      if (value !== undefined) {
        setValue(key, value);
      }
    });
  }, [payment, setValue]);

  React.useEffect(() => {
    if (!configId) return;

    loadAccounts({
      variables: {
        configId,
      },
    });
  }, [configId, loadAccounts]);

  if (loading) {
    return <Spinner />;
  }

  const configs = data?.tdbConfigsList?.list ?? [];

  const accounts = (accountsData?.tdbAccounts?.data ?? []).filter(
    (account: any) => account.CURCODE === 'MNT' && account.IBAN,
  );

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
                onValueChange={(value) => {
                  field.onChange(value);

                  setValue('accountNumber', '');
                  setValue('iban', '');
                  setValue('accountName', '');
                }}
              >
                <Select.Trigger>
                  <Select.Value placeholder={t('select-config')} />
                </Select.Trigger>

                <Select.Content>
                  <Select.Group>
                    {configs.map((config: any) => (
                      <Select.Item key={config._id} value={config._id}>
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

      <Form.Field
        name="accountNumber"
        control={control}
        render={({ field }: any) => (
          <Form.Item>
            <Form.Label>{t('account')} *</Form.Label>

            <Form.Control>
              <Select
                value={field.value}
                disabled={!configId || accountsLoading}
                onValueChange={(value) => {
                  field.onChange(value);

                  const account = accounts.find(
                    (item: any) => item.ACNTNO === value,
                  );

                  setValue('iban', account?.IBAN || account?.iban || '');

                  setValue('accountName', account?.ACNTNAME || '');
                }}
              >
                <Select.Trigger>
                  <Select.Value
                    placeholder={
                      accountsLoading ? t('loading') : t('select-account')
                    }
                  />
                </Select.Trigger>

                <Select.Content>
                  <Select.Group>
                    {accounts.map((account: any) => (
                      <Select.Item key={account.ACNTNO} value={account.ACNTNO}>
                        {account.ACNTNO} - {account.ACNTNAME}
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select>
            </Form.Control>
          </Form.Item>
        )}
      />

      <input type="hidden" {...register('iban')} />
      <input type="hidden" {...register('accountName')} />
    </div>
  );
};

export default TdbCGWForm;
