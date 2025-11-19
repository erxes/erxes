import { useState, useEffect } from 'react';
import { Button, Input, Label, Select, Form } from 'erxes-ui';
import { useAtom } from 'jotai';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { paymentMethodsAtom } from '../../states/posCategory';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PaymentFormValues, paymentSchema } from '../formSchema';
import { useToast } from 'erxes-ui';
import { PaymentMethod } from '../../types';
import { IPosDetail } from '@/pos/pos-detail/types/IPos';
import PaymentIcon from './paymentIcon';
import { usePayments } from '../../hooks/usePayments';

interface EcommercePaymentsFormProps {
  posDetail?: IPosDetail;
  form?: UseFormReturn<PaymentFormValues>;
  onFormSubmit?: (data: PaymentFormValues) => void;
}

export default function EcommercePaymentsForm({
  posDetail,
  form: externalForm,
  onFormSubmit,
}: EcommercePaymentsFormProps) {
  const [paymentMethods, setPaymentMethods] = useAtom(paymentMethodsAtom);

  const { toast } = useToast();
  const { payments, loading: paymentsLoading } = usePayments({
    status: 'active',
  });

  const internalForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentIds: [],
      paymentTypes: [],
    },
  });

  const form = externalForm || internalForm;
  const {
    control,
    setValue,
    getValues,
    formState: { errors },
  } = form;

  const [newPaymentMethod, setNewPaymentMethod] = useState<PaymentMethod>({
    type: '',
    title: '',
    icon: '',
    config: '',
  });

  useEffect(() => {
    if (posDetail) {
      const paymentTypesData = posDetail.paymentTypes || [];
      const processedPaymentTypes = paymentTypesData.map((item: any) => {
        if (typeof item === 'string') {
          return { type: item, title: '', icon: '', config: '', _id: '' };
        } else if (typeof item === 'object' && item !== null) {
          return {
            _id: item._id || '',
            type: item.type || '',
            title: item.title || '',
            icon: item.icon || '',
            config: item.config || '',
          };
        }
        return { type: '', title: '', icon: '', config: '', _id: '' };
      });

      form.reset({
        paymentIds: posDetail.paymentIds || [],
        paymentTypes: processedPaymentTypes,
        erxesAppToken: (posDetail as any).erxesAppToken || '',
      });
      setPaymentMethods(processedPaymentTypes);
    }
  }, [posDetail, form]);

  const handleInputChange = (field: keyof PaymentMethod, value: string) => {
    setNewPaymentMethod({
      ...newPaymentMethod,
      [field]: value,
    });
  };

  const generateId = () => Math.random().toString();

  const handleAddPaymentMethod = () => {
    if (!newPaymentMethod.type || !newPaymentMethod.title) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in both type and title fields',
        variant: 'destructive',
      });
      return;
    }

    const paymentType: PaymentMethod = {
      _id: generateId(),
      type: newPaymentMethod.type,
      title: newPaymentMethod.title,
      icon: newPaymentMethod.icon,
      config: newPaymentMethod.config,
    };

    const updatedPaymentMethods = [...paymentMethods, paymentType];
    setPaymentMethods(updatedPaymentMethods);

    setValue('paymentTypes', updatedPaymentMethods);

    if (onFormSubmit) {
      onFormSubmit({
        paymentIds: getValues('paymentIds'),
        paymentTypes: updatedPaymentMethods,
      });
    }

    setNewPaymentMethod({
      type: '',
      title: '',
      icon: '',
      config: '',
    });
  };

  const handleRemovePaymentMethod = (index: number) => {
    const updatedMethods = [...paymentMethods];
    updatedMethods.splice(index, 1);
    setPaymentMethods(updatedMethods);

    setValue('paymentTypes', updatedMethods);

    if (onFormSubmit) {
      onFormSubmit({
        paymentIds: getValues('paymentIds'),
        paymentTypes: updatedMethods,
      });
    }
  };

  return (
    <div className="p-3">
      <Form {...form}>
        <div className="space-y-6">
          {/* Standard Payments Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium uppercase text-primary">
              PAYMENTS
            </h2>
            <p className="text-sm text-muted-foreground">
              Select payments that you want to use
            </p>

            <Form.Field
              control={control}
              name="paymentIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Control>
                    <Select
                      value={field.value?.[0] || ''}
                      onValueChange={(value) => field.onChange([value])}
                      disabled={paymentsLoading}
                    >
                      <Select.Trigger className="justify-between px-3 w-full h-8 text-left">
                        <Select.Value
                          placeholder={
                            paymentsLoading
                              ? 'Loading payments...'
                              : 'Choose payments'
                          }
                        />
                      </Select.Trigger>
                      <Select.Content>
                        {payments.map((payment) => (
                          <Select.Item key={payment._id} value={payment._id}>
                            {payment.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <div className="space-y-2">
              <Label className="text-sm font-semibold uppercase">
                ERXES APP TOKEN
              </Label>
              <Input
                value={form.watch('erxesAppToken') || ''}
                onChange={(e) => form.setValue('erxesAppToken', e.target.value)}
                className="h-8"
                placeholder="Enter your Erxes app token"
              />
            </div>
          </div>

          {/* Other Payments Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-medium uppercase text-primary">
              OTHER PAYMENTS
            </h2>
            <p className="text-sm text-muted-foreground">
              Type is must latin, some default types: golomtCard, khaanCard,
              TDBCard
              <br />
              Хэрэв тухайн талбэрт ебаримт хавлагүй бол: "skipEbarimt: true",
              Харилцагч сонгосон үед л харагдах бол: "mustCustomer: true", Харав
              хуваах боломжгүй бол: "notSplit: true" Үрэдчилж төлсөн төлбөрөөр
              <br />
              (Татвар тооцсон) бол: "preTax: true
            </p>

            <div className="flex justify-end mb-4">
              <Button
                type="button"
                variant="default"
                onClick={handleAddPaymentMethod}
                className="flex gap-2 items-center"
              >
                <IconPlus size={16} />
                Add payments method
              </Button>
            </div>

            {/* Display and edit existing payment methods */}
            {paymentMethods.map((method: PaymentMethod, index: number) => (
              <div key={method._id || index} className="grid grid-cols-4 gap-4">
                <div>
                  <Label className="block mb-2 text-xs">Type *</Label>
                  <Input
                    value={method.type}
                    className="h-8"
                    onChange={(e) =>
                      handleUpdatePaymentMethod(index, 'type', e.target.value)
                    }
                    placeholder="e.g. golomtCard, khaanCard"
                  />
                </div>
                <div>
                  <Label className="block mb-2 text-xs">Title *</Label>
                  <Input
                    value={method.title}
                    className="h-8"
                    onChange={(e) =>
                      handleUpdatePaymentMethod(index, 'title', e.target.value)
                    }
                    placeholder="e.g. Visa, Mastercard"
                  />
                </div>
                <div>
                  <Label className="block mb-2 text-xs">Icon</Label>
                  <Select
                    value={method.icon}
                    onValueChange={(value: string) =>
                      handleUpdatePaymentMethod(index, 'icon', value)
                    }
                  >
                    <Select.Trigger className="justify-between px-3 w-full h-8 text-left">
                      <Select.Value placeholder="Select icon" />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="credit-card">
                        <div className="flex gap-2 items-center">
                          <PaymentIcon iconType="credit-card" size={16} />
                          Credit Card
                        </div>
                      </Select.Item>
                      <Select.Item value="cash">
                        <div className="flex gap-2 items-center">
                          <PaymentIcon iconType="cash" size={16} />
                          Cash
                        </div>
                      </Select.Item>
                      <Select.Item value="bank">
                        <div className="flex gap-2 items-center">
                          <PaymentIcon iconType="bank" size={16} />
                          Bank
                        </div>
                      </Select.Item>
                      <Select.Item value="mobile">
                        <div className="flex gap-2 items-center">
                          <PaymentIcon iconType="mobile" size={16} />
                          Mobile
                        </div>
                      </Select.Item>
                      <Select.Item value="visa">
                        <div className="flex gap-2 items-center">
                          <PaymentIcon iconType="visa" size={16} />
                          Visa
                        </div>
                      </Select.Item>
                      <Select.Item value="mastercard">
                        <div className="flex gap-2 items-center">
                          <PaymentIcon iconType="mastercard" size={16} />
                          Mastercard
                        </div>
                      </Select.Item>
                    </Select.Content>
                  </Select>
                </div>
                <div className="flex gap-2 justify-between items-end">
                  <div className="flex-1">
                    <Label className="block mb-2 text-xs">Config</Label>
                    <Input
                      value={method.config}
                      className="h-8"
                      onChange={(e) =>
                        handleUpdatePaymentMethod(
                          index,
                          'config',
                          e.target.value,
                        )
                      }
                      placeholder='e.g. { "skipEbarimt": true }'
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemovePaymentMethod(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <IconTrash size={16} />
                  </Button>
                </div>
              </div>
            ))}

            {/* Add new payment method form */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="block mb-2 text-xs">Type *</Label>
                <Input
                  value={newPaymentMethod.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="h-8"
                  placeholder="e.g. golomtCard, khaanCard, TDBCard"
                />
              </div>
              <div>
                <Label className="block mb-2 text-xs">Title *</Label>
                <Input
                  value={newPaymentMethod.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="h-8"
                  placeholder="e.g. Visa, Mastercard"
                />
              </div>
              <div>
                <Label className="block mb-2 text-xs">Icon</Label>
                <Select
                  value={newPaymentMethod.icon}
                  onValueChange={(value: string) =>
                    handleInputChange('icon', value)
                  }
                >
                  <Select.Trigger className="justify-between px-3 w-full h-8 text-left">
                    <Select.Value placeholder="Select icon" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="credit-card">
                      <div className="flex gap-2 items-center">
                        <PaymentIcon iconType="credit-card" size={16} />
                        Credit Card
                      </div>
                    </Select.Item>
                    <Select.Item value="cash">
                      <div className="flex gap-2 items-center">
                        <PaymentIcon iconType="cash" size={16} />
                        Cash
                      </div>
                    </Select.Item>
                    <Select.Item value="bank">
                      <div className="flex gap-2 items-center">
                        <PaymentIcon iconType="bank" size={16} />
                        Bank
                      </div>
                    </Select.Item>
                    <Select.Item value="mobile">
                      <div className="flex gap-2 items-center">
                        <PaymentIcon iconType="mobile" size={16} />
                        Mobile
                      </div>
                    </Select.Item>
                    <Select.Item value="visa">
                      <div className="flex gap-2 items-center">
                        <PaymentIcon iconType="visa" size={16} />
                        Visa
                      </div>
                    </Select.Item>
                    <Select.Item value="mastercard">
                      <div className="flex gap-2 items-center">
                        <PaymentIcon iconType="mastercard" size={16} />
                        Mastercard
                      </div>
                    </Select.Item>
                  </Select.Content>
                </Select>
              </div>
              <div>
                <Label className="block mb-2 text-xs">Config</Label>
                <Input
                  value={newPaymentMethod.config}
                  onChange={(e) => handleInputChange('config', e.target.value)}
                  className="h-8"
                  placeholder="e.g. skipEbarimt: true, mustCustomer: true"
                />
              </div>
            </div>

            <Form.Field
              control={control}
              name="paymentTypes"
              render={() => (
                <Form.Item>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </div>
      </Form>
    </div>
  );
}
