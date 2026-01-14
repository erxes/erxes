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
          <Form.Label>PAYMENTS</Form.Label>
          <Form.Description>
            Select payments that you want to use
          </Form.Description>
          <div className="flex gap-4 justify-between items-end">
            <Form.Control className="flex-1">
              <Select
                value={
                  Array.isArray(field.value)
                    ? field.value[0] || ''
                    : field.value || ''
                }
                onValueChange={field.onChange}
                disabled={loading}
              >
                <Select.Trigger className="placeholder:text-accent-foreground/70">
                  <Select.Value
                    placeholder={loading ? 'Loading...' : 'Select payments'}
                  />
                </Select.Trigger>
                <Select.Content>
                  {isEmpty ? (
                    <Select.Item value="__empty__" disabled>
                      the payment list is empty
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
          </div>
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
        <Form.Item className="py-3 border-y">
          <Form.Label>Erxes app token</Form.Label>
          <Form.Description>What is erxes app token ?</Form.Description>
          <Form.Control>
            <Input
              className="w-full h-8 rounded-md"
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
    append({ type: '', title: '', icon: '', config: '' });
  };

  return (
    <div className="py-3">
      <div className="flex flex-col gap-2 items-start self-stretch">
        <h2 className="self-stretch text-[#4F46E5] text-sm font-medium leading-tight">
          Other Payments
        </h2>

        <p className="text-[#71717A] font-['Inter'] text-xs font-medium leading-[140%]">
          Type is must latin, some default types: golomtCard, khaanCard, TDBCard
          Хэрэв тухайн төлбөрт ебаримт хэвлэхгүй бол: "skipEbarimt: true",
          Харилцагч сонгосон үед л харагдах бол: "mustCustomer: true", Хэрэв
          хуваах боломжгүй бол: "notSplit: true" Урьдчилж төлсөн төлбөрөөр
          (Татвар тооцсон) бол: "preTax: true
        </p>
      </div>

      <div className="flex gap-2 justify-end items-center p-3 pt-5">
        <Button
          variant="default"
          className="flex gap-2 items-center mb-6"
          onClick={handleAddPayment}
          type="button"
        >
          <IconPlus size={16} />
          Add payment method
        </Button>
      </div>

      {fields.map((field, index) => (
        <div key={field.id} className="rounded-lg border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Form.Field
                control={control}
                name={`otherPayments.${index}.type`}
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-xs font-medium">
                      TYPE
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
                      TITLE
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
                      ICON
                    </Form.Label>
                    <Select
                      value={field.value || ''}
                      onValueChange={field.onChange}
                    >
                      <Form.Control>
                        <Select.Trigger>
                          <Select.Value placeholder="Select">
                            {field.value && (
                              <div className="flex gap-2 items-center">
                                <PaymentIcon iconType={field.value} size={16} />
                                <span className="text-sm truncate">
                                  {
                                    paymentIconOptions.find(
                                      (icon) => icon.value === field.value,
                                    )?.label
                                  }
                                </span>
                              </div>
                            )}
                          </Select.Value>
                        </Select.Trigger>
                      </Form.Control>
                      <Select.Content>
                        {paymentIconOptions.map((icon) => (
                          <Select.Item key={icon.value} value={icon.value}>
                            <div className="flex gap-2 items-center">
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
                      CONFIG
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
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 ml-2 text-destructive hover:text-destructive"
              type="button"
              onClick={() => remove(index)}
            >
              <IconTrash size={16} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
