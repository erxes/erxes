import { gql, useQuery } from '@apollo/client';
import { Input, Select, Spinner } from 'erxes-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';

import { IPaymentDocument } from '../../../payment/types/Payment';

const CONFIGS_QUERY = gql`
  query GolomtBankConfigsList($page: Int, $perPage: Int) {
    golomtBankConfigsList(page: $page, perPage: $perPage) {
      list {
        _id
        name
        accountId
      }
      totalCount
    }
  }
`;

type Config = {
  _id: string;
  name: string;
  accountId: string;
};

type QueryResponse = {
  golomtBankConfigsList: {
    list: Config[];
    totalCount: number;
  };
};

type Props = {
  payment?: IPaymentDocument;
  form: UseFormReturn<any>;
  Form: typeof import('erxes-ui/components/form').Form;
};

const CorporateGolomtBankForm: React.FC<Props> = ({
  payment,
  form,
  Form,
}) => {
  const { t } = useTranslation('payment');

  const { register, watch, setValue, control } = form;

  const configId = watch('configId');

  const { data, loading } = useQuery<QueryResponse>(CONFIGS_QUERY, {
    variables: {
      page: 1,
      perPage: 999,
    },
  });

  const configs = data?.golomtBankConfigsList?.list ?? [];

  const selectedConfig = configs.find(
    (config) => config._id === configId,
  );

  React.useEffect(() => {
    if (!payment?.config) {
      return;
    }

    Object.entries(payment.config).forEach(([key, value]) => {
      if (value !== undefined) {
        setValue(key, value);
      }
    });
  }, [payment, setValue]);

  React.useEffect(() => {
    if (!configId) {
      setValue('accountId', '');
      return;
    }

    setValue('accountId', selectedConfig?.accountId ?? '');
  }, [configId, selectedConfig, setValue]);

  if (loading) {
    return <Spinner />;
  }

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
                    {configs.map((config) => (
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
        <Form.Item>
          <Form.Label>{t('account')}</Form.Label>

          <Form.Control>
            <Input
              value={selectedConfig?.accountId ?? ''}
              readOnly
            />
          </Form.Control>
        </Form.Item>
      )}

      <input type="hidden" {...register('accountId')} />

      <div className="col-span-2">
        <a
          href="https://www.golomtbank.com/en/corporate/product/429?activetab=2"
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

export default CorporateGolomtBankForm;