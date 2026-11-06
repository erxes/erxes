import { Form, Input, Select, Spinner } from 'erxes-ui';
import React from 'react';
import { FieldValues, UseFormReturn } from 'react-hook-form';

import { IPaymentDocument } from '~/modules/payment/types/Payment';

import { useTdbCGWForm } from '../hooks/useTdbCGWForm';

type Props = {
  payment?: IPaymentDocument;
  form: UseFormReturn<FieldValues>;
};

const TdbCGWForm: React.FC<Props> = ({ payment, form }) => {
  const { register, control } = form;

  const {
    t,
    loading,
    configOptions,
    accountOptions,
    isAccountDisabled,
    accountPlaceholder,
    handleConfigChange,
    handleAccountChange,
  } = useTdbCGWForm(form, payment);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <Form.Item>
        <Form.Label>{t('name')} *</Form.Label>
        <Form.Control>
          <Input {...register('name', { required: true })} />
        </Form.Control>
      </Form.Item>

      <Form.Field
        name="configId"
        control={control}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('config')} *</Form.Label>
            <Form.Control>
              <Select
                value={field.value}
                onValueChange={(value) =>
                  handleConfigChange(value, field.onChange)
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder={t('select-config')} />
                </Select.Trigger>
                <Select.Content>
                  <Select.Group>
                    {configOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
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
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('account')} *</Form.Label>
            <Form.Control>
              <Select
                value={field.value}
                disabled={isAccountDisabled}
                onValueChange={(value) =>
                  handleAccountChange(value, field.onChange)
                }
              >
                <Select.Trigger>
                  <Select.Value placeholder={accountPlaceholder} />
                </Select.Trigger>
                <Select.Content>
                  <Select.Group>
                    {accountOptions.map((option) => (
                      <Select.Item key={option.value} value={option.value}>
                        {option.label}
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
