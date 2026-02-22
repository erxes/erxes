import { Input, Select, Switch } from 'erxes-ui';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import SelectDistrict from '~/modules/settings/payment/components/SelectDistrict';
import { BANK_CODES, CITIES, MCC_CODES } from '~/modules/payment/constants';
import {
  IPaymentDocument,
  BankCode,
  City,
  MccCode,
} from '../../../payment/types/Payment';

export type QuickQrFormValues = {
  type?: 'company' | 'person';
  companyName?: string;
  firstName?: string;
  lastName?: string;
  registerNumber?: string;
  mccCode?: string;
  city?: string;
  district?: string;
  businessName?: string;
  address?: string;
  phone?: string;
  email?: string;
  bankAccount?: string;
  bankCode?: string;
  ibanNumber?: string;
  bankAccountName?: string;
  isFlat?: boolean;
};

type Props = {
  payment?: IPaymentDocument;
  form: UseFormReturn<any>; // ← IMPORTANT: matches PaymentForm
  Form: typeof import('erxes-ui/components/form').Form;
};

const QuickQrForm: React.FC<Props> = ({ payment, form, Form }) => {
  const { register, watch, setValue, control } = form;

  const type = watch('type');
  const isCompany = type === 'company';

  React.useEffect(() => {
    if (!payment?.config) return;

    const config = payment.config;

    const configValues: Record<string, unknown> = { ...config };

    if (config.isCompany !== undefined) {
      configValues.type = config.isCompany ? 'company' : 'person';
    } else {
      configValues.type = 'company';
    }

    Object.entries(configValues).forEach(([key, value]) => {
      if (value !== undefined) {
        setValue(key, value);
      }
    });
  }, [payment, setValue]);

  const renderItem = (
    name: keyof QuickQrFormValues,
    label: string,
    required = true,
    inputType: 'text' | 'number' | 'email' | 'password' = 'text',
  ) => (
    <Form.Item>
      <Form.Label>
        {label} {required && '*'}
      </Form.Label>
      <Form.Control>
        <Input
          {...register(name as any, {
            required: required ? `${label} is required` : false,
          })}
          type={inputType}
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      </Form.Control>
    </Form.Item>
  );

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <Form.Field
        name="type"
        control={control}
        render={({ field }: any) => (
          <Form.Item>
            <Form.Label>Type *</Form.Label>
            <Form.Control>
              <Select value={field.value} onValueChange={field.onChange}>
                <Select.Trigger>
                  <Select.Value placeholder="Select type" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Group>
                    <Select.Item value="company">Байгууллага</Select.Item>
                    <Select.Item value="person">Хувь хүн</Select.Item>
                  </Select.Group>
                </Select.Content>
              </Select>
            </Form.Control>
          </Form.Item>
        )}
      />

      {type && (
        <>
          {isCompany && renderItem('companyName', 'Company Name')}
          {!isCompany && renderItem('firstName', 'First Name')}
          {!isCompany && renderItem('lastName', 'Last Name')}

          {renderItem('registerNumber', 'Register Number')}

          <Form.Field
            name="mccCode"
            control={control}
            render={({ field }: any) => (
              <Form.Item>
                <Form.Label>MCC Code *</Form.Label>
                <Form.Control>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value placeholder="Select MCC Code" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Group>
                        {MCC_CODES.map((code: MccCode) => (
                          <Select.Item key={code.value} value={code.value}>
                            {code.label}
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
            name="city"
            control={control}
            render={({ field }: any) => (
              <Form.Item>
                <Form.Label>City *</Form.Label>
                <Form.Control>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <Select.Trigger>
                      <Select.Value placeholder="Select city" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Group>
                        {CITIES.map((city: City) => (
                          <Select.Item key={city.code} value={city.code}>
                            {city.name}
                          </Select.Item>
                        ))}
                      </Select.Group>
                    </Select.Content>
                  </Select>
                </Form.Control>
              </Form.Item>
            )}
          />

          <Form.Item>
            <Form.Label>District *</Form.Label>
            <SelectDistrict
              cityCode={watch('city')}
              value={watch('district')}
              onChange={(value: string) => setValue('district', value)}
            />
          </Form.Item>

          {renderItem('businessName', 'Business Name')}
          {renderItem('address', 'Address')}
          {renderItem('phone', 'Phone')}
          {renderItem('email', 'Email', true, 'email')}
          {renderItem('bankAccount', 'Account Number')}

          <Form.Item>
            <Form.Label>Bank *</Form.Label>
            <Form.Control>
              <Select
                value={watch('bankCode')}
                onValueChange={(value) => setValue('bankCode', value)}
              >
                <Select.Trigger>
                  <Select.Value placeholder="Select bank" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Group>
                    {BANK_CODES.map((bank: BankCode) => (
                      <Select.Item key={bank.value} value={bank.value}>
                        {bank.label}
                      </Select.Item>
                    ))}
                  </Select.Group>
                </Select.Content>
              </Select>
            </Form.Control>
          </Form.Item>

          {renderItem('ibanNumber', 'IBAN Number')}
          {renderItem('bankAccountName', 'Account Name')}

          {!payment && (
            <Form.Field
              name="isFlat"
              control={control}
              render={({ field }: any) => (
                <Form.Item>
                  <Form.Label>Is flat</Form.Label>
                  <Form.Control>
                    <Switch
                      checked={field.value === true}
                      onCheckedChange={field.onChange}
                    />
                  </Form.Control>
                </Form.Item>
              )}
            />
          )}
        </>
      )}
    </div>
  );
};

export default QuickQrForm;
