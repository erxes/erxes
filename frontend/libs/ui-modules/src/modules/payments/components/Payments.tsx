'use client';

import { Button, Form, Input, Select } from 'erxes-ui';
import { Control, useFieldArray } from 'react-hook-form';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import PaymentIcon, { paymentIconOptions } from './PaymentIcon';

import { PAYMENT_LIST } from '../graphql/queries';
import { useQuery } from '@apollo/client';

export interface PaymentType {
  _id: string;
  name: string;
  kind: string;
  status: string;
  config: any;
  createdAt: string;
}

export const Payments = ({ control }: { control: Control<any> }) => {
  const { data: paymentsData, loading } = useQuery(PAYMENT_LIST);
  const payments: PaymentType[] = paymentsData?.payments ?? [];

  const isEmpty = !loading && payments.length === 0;

  return (
    <Form.Field
      control={control}
      name="payment"
      render={({ field }) => (
        <Form.Item>
          <Form.Label className="text-sm font-medium">Payments</Form.Label>
          <Form.Description className="text-sm text-muted-foreground">
            Select payments that you want to use
          </Form.Description>
          <Form.Control>
            <Select
              value={
                Array.isArray(field.value)
                  ? field.value[0] || ''
                  : field.value || ''
              }
              onValueChange={field.onChange}
              disabled={loading}
            >
              <Select.Trigger className="placeholder:text-muted-foreground/70">
                <Select.Value
                  placeholder={loading ? 'Loading...' : 'Select payments'}
                />
              </Select.Trigger>
              <Select.Content>
                {isEmpty ? (
                  <Select.Item value="__empty__" disabled>
                    The payment list is empty
                  </Select.Item>
                ) : (
                  payments.map((payment: PaymentType) => (
                    <Select.Item key={payment._id} value={payment._id}>
                      {payment.name}
                    </Select.Item>
                  ))
                )}
              </Select.Content>
            </Select>
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const Token = ({ control }: { control: Control<any> }) => {
  return (
    <Form.Field
      control={control}
      name="token"
      render={({ field }) => (
        <Form.Item>
          <Form.Label className="text-sm font-medium">
            Erxes App Token
          </Form.Label>
          <Form.Description className="text-sm text-muted-foreground">
            What is erxes app token?
          </Form.Description>
          <Form.Control>
            <Input
              className="w-full"
              placeholder="Enter app token"
              {...field}
            />
          </Form.Control>
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};

export const OtherPayments = ({ control }: { control: Control<any> }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'otherPayments',
  });

  const handleAddPayment = () => {
    append({
      _id: Math.random().toString(),
      type: '',
      title: '',
      icon: '',
      config: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Other Payments</h3>
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Type must be latin, some default types: golomtCard, khaanCard,
            TDBCard. Хэрэв тухайн төлбөрт ебаримт хэвлэхгүй бол: "skipEbarimt:
            true". Харилцагч сонгосон үед л харагдах бол: "mustCustomer: true".
            Хэрэв хуваах боломжгүй бол: "notSplit: true". Урьдчилж төлсөн
            төлбөрөөр (Татвар тооцсон) бол: "preTax: true".
          </p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="outline"
          className="flex gap-2 items-center"
          onClick={handleAddPayment}
          type="button"
        >
          <IconPlus size={16} />
          Add payment method
        </Button>
      </div>

      {fields.length > 0 && (
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="rounded-lg border bg-card p-4 space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Payment Method #{index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  type="button"
                  onClick={() => remove(index)}
                >
                  <IconTrash size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Form.Field
                  control={control}
                  name={`otherPayments.${index}.type`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label className="text-xs font-medium">
                        Type
                      </Form.Label>
                      <Form.Control>
                        <Input placeholder="e.g., golomtCard" {...field} />
                      </Form.Control>
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={control}
                  name={`otherPayments.${index}.title`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label className="text-xs font-medium">
                        Title
                      </Form.Label>
                      <Form.Control>
                        <Input placeholder="Payment title" {...field} />
                      </Form.Control>
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={control}
                  name={`otherPayments.${index}.icon`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label className="text-xs font-medium">
                        Icon
                      </Form.Label>
                      <Select
                        value={field.value || ''}
                        onValueChange={field.onChange}
                      >
                        <Form.Control>
                          <Select.Trigger>
                            <Select.Value>
                              {field.value ? (
                                <div className="flex items-center gap-2">
                                  <PaymentIcon
                                    iconType={field.value}
                                    size={16}
                                  />
                                  <span className="text-sm truncate">
                                    {
                                      paymentIconOptions.find(
                                        (icon) => icon.value === field.value,
                                      )?.label
                                    }
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  Select icon
                                </span>
                              )}
                            </Select.Value>
                          </Select.Trigger>
                        </Form.Control>
                        <Select.Content>
                          {paymentIconOptions.map((icon) => (
                            <Select.Item key={icon.value} value={icon.value}>
                              <div className="flex items-center gap-2">
                                <PaymentIcon iconType={icon.value} size={16} />
                                {icon.label}
                              </div>
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select>
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={control}
                  name={`otherPayments.${index}.config`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label className="text-xs font-medium">
                        Config
                      </Form.Label>
                      <Form.Control>
                        <Input
                          placeholder='e.g., "skipEbarimt: true"'
                          {...field}
                        />
                      </Form.Control>
                    </Form.Item>
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
