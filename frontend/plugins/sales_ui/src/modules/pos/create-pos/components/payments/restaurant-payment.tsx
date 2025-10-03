import { useState, useEffect } from 'react';
import { Button, Label, Select, Input, Form } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
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

interface RestaurantPaymentsFormProps {
  posDetail?: IPosDetail;
  form?: UseFormReturn<PaymentFormValues>;
  onFormSubmit?: (data: PaymentFormValues) => void;
}

export default function RestaurantPaymentsForm({
  posDetail,
  form: externalForm,
  onFormSubmit,
}: RestaurantPaymentsFormProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentMethods, setPaymentMethods] = useAtom(paymentMethodsAtom);
  const [appToken, setAppToken] = useState('');
  const { toast } = useToast();

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
    handleSubmit,
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
      });
      setPaymentMethods(processedPaymentTypes);
      setAppToken(posDetail.erxesAppToken || '');
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

  const handleFormSubmit = (formData: PaymentFormValues) => {
    if (onFormSubmit) {
      onFormSubmit(formData);
    }
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', 'permission');
    setSearchParams(newParams);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="p-3">
        <div className="space-y-6">
          {/* Standard Payments Section */}
          <div className="space-y-4">
            <h2 className="text-indigo-600 text-xl font-medium uppercase">
              PAYMENTS
            </h2>
            <p className="text-sm text-gray-500">
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
                    >
                      <Select.Trigger className="w-full h-10 px-3 text-left justify-between">
                        <Select.Value placeholder="Choose payments" />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="cash">Cash</Select.Item>
                        <Select.Item value="card">Card</Select.Item>
                        <Select.Item value="mobile">Mobile Payment</Select.Item>
                      </Select.Content>
                    </Select>
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <div className="space-y-2">
              <Label className="text-sm text-[#A1A1AA] uppercase font-semibold">
                ERXES APP TOKEN
              </Label>
              <Input
                value={appToken}
                onChange={(e) => setAppToken(e.target.value)}
                className="h-10"
                placeholder="Enter your Erxes app token"
              />
            </div>
          </div>

          {/* Other Payments Section */}
          <div className="space-y-4">
            <h2 className="text-indigo-600 text-xl font-medium uppercase">
              OTHER PAYMENTS
            </h2>
            <p className="text-sm text-gray-500">
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
                onClick={handleAddPaymentMethod}
                className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2"
              >
                <IconPlus size={16} />
                Add payments method
              </Button>
            </div>

            {/* Display existing payment methods */}
            {paymentMethods.map((method: PaymentMethod, index: number) => (
              <div
                key={method._id || index}
                className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg mb-2"
              >
                <div>
                  <Label className="text-xs text-gray-500">Type</Label>
                  <div className="font-medium">{method.type}</div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Title</Label>
                  <div className="font-medium flex items-center gap-2">
                    {method.icon && (
                      <PaymentIcon iconType={method.icon} size={16} />
                    )}
                    {method.title}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500">Icon</Label>
                  <div className="font-medium flex items-center gap-2">
                    {method.icon && (
                      <PaymentIcon iconType={method.icon} size={16} />
                    )}
                    {method.icon}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-xs text-gray-500">Config</Label>
                    <div className="font-medium text-sm">{method.config}</div>
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
                <Label className="text-xs text-gray-500 mb-1 block">
                  Type *
                </Label>
                <Input
                  value={newPaymentMethod.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="h-10"
                  placeholder="e.g. golomtCard, khaanCard, TDBCard"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">
                  Title *
                </Label>
                <Input
                  value={newPaymentMethod.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="h-10"
                  placeholder="e.g. Visa, Mastercard"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Icon</Label>
                <Select
                  value={newPaymentMethod.icon}
                  onValueChange={(value: string) =>
                    handleInputChange('icon', value)
                  }
                >
                  <Select.Trigger className="w-full h-10 px-3 text-left justify-between">
                    <Select.Value placeholder="Select icon" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="credit-card">
                      <div className="flex items-center gap-2">
                        <PaymentIcon iconType="credit-card" size={16} />
                        Credit Card
                      </div>
                    </Select.Item>
                    <Select.Item value="cash">
                      <div className="flex items-center gap-2">
                        <PaymentIcon iconType="cash" size={16} />
                        Cash
                      </div>
                    </Select.Item>
                    <Select.Item value="bank">
                      <div className="flex items-center gap-2">
                        <PaymentIcon iconType="bank" size={16} />
                        Bank
                      </div>
                    </Select.Item>
                    <Select.Item value="mobile">
                      <div className="flex items-center gap-2">
                        <PaymentIcon iconType="mobile" size={16} />
                        Mobile
                      </div>
                    </Select.Item>
                    <Select.Item value="visa">
                      <div className="flex items-center gap-2">
                        <PaymentIcon iconType="visa" size={16} />
                        Visa
                      </div>
                    </Select.Item>
                    <Select.Item value="mastercard">
                      <div className="flex items-center gap-2">
                        <PaymentIcon iconType="mastercard" size={16} />
                        Mastercard
                      </div>
                    </Select.Item>
                  </Select.Content>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">
                  Config
                </Label>
                <Input
                  value={newPaymentMethod.config}
                  onChange={(e) => handleInputChange('config', e.target.value)}
                  className="h-10"
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
      </form>
    </Form>
  );
}
