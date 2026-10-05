import { gql, useQuery } from '@apollo/client';
import { Form, Input, Select, Spinner } from 'erxes-ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { FieldValues, UseFormReturn } from 'react-hook-form';

import { IPaymentDocument } from '../../../payment/types/Payment';

const CONFIGS_QUERY = gql`
  query TdbConfigsList($page: Int, $perPage: Int) {
    tdbConfigsList(page: $page, perPage: $perPage) {
      list {
        _id
        name
      }
      totalCount
    }
  }
`;

type Props = {
  payment?: IPaymentDocument;
  form: UseFormReturn<FieldValues>;
};

const TdbCGWForm: React.FC<Props> = ({ payment, form }) => {
  const { t } = useTranslation('payment');

  const { register, setValue, control } = form;

  const { loading, data } = useQuery(CONFIGS_QUERY, {
    variables: {
      page: 1,
      perPage: 999,
    },
  });

  React.useEffect(() => {
    if (!payment?.config) return;

    Object.entries(payment.config).forEach(([key, value]) => {
      if (value !== undefined) {
        setValue(key, value);
      }
    });
  }, [payment, setValue]);

  if (loading) {
    return <Spinner />;
  }

  const configs = data?.tdbConfigsList?.list ?? [];

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
              <Select value={field.value} onValueChange={field.onChange}>
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
    </div>
  );
};

export default TdbCGWForm;
