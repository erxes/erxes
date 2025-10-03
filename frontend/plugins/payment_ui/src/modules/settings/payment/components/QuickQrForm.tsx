import { Input, Select, Switch } from 'erxes-ui';
import React from 'react';
import SelectDistrict from '~/modules/settings/payment/components/SelectDistrict';
import { BANK_CODES, CITIES, MCC_CODES } from '~/modules/payment/constants';
import { IPaymentDocument, BankCode, City, MccCode } from '../../../payment/types/Payment';

type Props = {
  payment?: IPaymentDocument;
  form: any;
  Form: any;
};

type FormValues = {
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
};

const QuickQrForm: React.FC<Props> = ({ payment, form, Form }) => {
  const { register, watch, setValue } = form;

  const type = watch('type');
  const isCompany = type === 'company';

  // Set default values from payment config
  React.useEffect(() => {
    if (payment?.config) {
      const { config } = payment;
      const configValues: Record<string, any> = { ...config };

      // Map config to form fields
      if (config.isCompany !== undefined) {
        configValues.type = config.isCompany ? 'company' : 'person';
      } else {
        configValues.type = 'company';
      }

      // Set all values at once to prevent multiple re-renders
      Object.entries(configValues).forEach(([key, value]) => {
        if (value !== undefined) {
          setValue(key as keyof FormValues, value);
        }
      });
    }
  }, [payment, setValue]);

  const renderItem = (
    name: keyof FormValues,
    label: string,
    required = true,
    type: 'text' | 'number' | 'email' | 'password' = 'text',
  ) => {
    return (
      <Form.Item>
        <Form.Label>
          {label} {required && '*'}
        </Form.Label>
        <Form.Control>
          <Input
            {...register(name, {
              required: required && `${label} is required`,
            })}
            type={type}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        </Form.Control>
      </Form.Item>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <Form.Field
        name="type"
        control={form.control}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Type *</Form.Label>
            <Form.Control>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                }}
              >
                <Form.Control>
                  <Select.Trigger>
                    <Select.Value
                      placeholder={
                        <span className="text-sm font-medium text-center truncate text-muted-foreground">
                          {'Select type'}
                        </span>
                      }
                    >
                      <span className="text-sm font-medium text-foreground">
                        {field.value === 'company' ? 'Байгууллага' : 'Хувь хүн'}
                      </span>
                    </Select.Value>
                  </Select.Trigger>
                </Form.Control>
                <Select.Content className="border p-0 [&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
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
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>MCC Code *</Form.Label>
                <Form.Control>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select MCC Code" />
                    </Select.Trigger>
                    <Select.Content className="max-w-[300px] w-full border p-0">
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
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>City *</Form.Label>
                <Form.Control>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value placeholder="Select city" />
                    </Select.Trigger>
                    <Select.Content className="max-w-[300px] w-full border p-0">
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
              onChange={(value) => setValue('district', value)}
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
                <Select.Content className="max-w-[300px] w-full border p-0">
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
            <Form.Item>
              <Form.Label>Is flat</Form.Label>
              <Form.Field
                control={form.control}
                name="isFlat"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Control>
                      <Switch
                        id="mode"
                        onCheckedChange={(open) =>
                          field.onChange(open ? true : false)
                        }
                        checked={field.value === true}
                      />
                    </Form.Control>
                  </Form.Item>
                )}
              />
            </Form.Item>
          )}
        </>
      )}
    </div>
  );
};

export default QuickQrForm;
