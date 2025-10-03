import { Input, Label, Select, Switch, Form } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { IPosDetail } from '@/pos/pos-detail/types/IPos';
import { options } from '@/pos/constants';
import { FinanceConfigFormValues } from '@/pos/create-pos/components/formSchema';

interface FinanceConfigFormProps {
  form: UseFormReturn<FinanceConfigFormValues>;
  posDetail?: IPosDetail;
  isReadOnly?: boolean;
  onSubmit?: (data: FinanceConfigFormValues) => Promise<void>;
}

export default function FinanceConfigForm({
  form,
  posDetail,
  isReadOnly = false,
  onSubmit,
}: FinanceConfigFormProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, watch, handleSubmit, reset } = form;
  const isSyncErkhet = watch('isSyncErkhet');

  useEffect(() => {
    if (posDetail) {
      const financeData: FinanceConfigFormValues = {
        isSyncErkhet: posDetail.erkhetConfig?.isSyncErkhet ?? false,
        checkErkhet: posDetail.erkhetConfig?.checkErkhet ?? false,
        checkInventories: posDetail.isCheckRemainder ?? false,
        userEmail: posDetail.erkhetConfig?.userEmail || '',
        beginBillNumber:
          posDetail.beginNumber || posDetail.erkhetConfig?.beginNumber || '',
        defaultPay: posDetail.erkhetConfig?.defaultPay || '',
        account: posDetail.erkhetConfig?.account || '',
        location: posDetail.erkhetConfig?.location || '',
        getRemainder: posDetail.erkhetConfig?.getRemainder ?? false,
      };

      reset(financeData);
    }
  }, [posDetail, reset]);

  const onFormSubmit = async (data: FinanceConfigFormValues) => {
    console.log('Finance form data being submitted:', data);
    if (onSubmit) {
      try {
        setIsSubmitting(true);
        await onSubmit(data);
      } catch (error) {
        console.error('Finance config form submission failed:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('tab', 'delivery');
      setSearchParams(newParams);
    }
  };

  return (
    <div className="p-3">
      <Form {...form}>
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-indigo-600 text-xl font-medium">MAIN</h2>

              <Form.Field
                control={control}
                name="isSyncErkhet"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex flex-col gap-3">
                      <Form.Label className="text-gray-600">
                        IS SYNC ERKHET
                      </Form.Label>
                      <Form.Control>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </Form.Control>
                    </div>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-indigo-600 text-xl font-medium">REMAINDER</h2>

              <Form.Field
                control={control}
                name="checkErkhet"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex flex-col gap-3">
                      <Form.Label className="text-gray-600">
                        CHECK ERKHET
                      </Form.Label>
                      <Form.Control>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </Form.Control>
                    </div>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={control}
                name="checkInventories"
                render={({ field }) => (
                  <Form.Item>
                    <div className="flex flex-col gap-3">
                      <Form.Label className="text-gray-600">
                        CHECK INVENTORIES
                      </Form.Label>
                      <Form.Control>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isReadOnly}
                        />
                      </Form.Control>
                    </div>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>

            {isSyncErkhet && (
              <div className="space-y-6">
                <h2 className="text-indigo-600 text-xl font-medium">OTHER</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Form.Field
                    control={control}
                    name="userEmail"
                    render={({ field }) => (
                      <Form.Item>
                        <div className="space-y-2">
                          <Form.Label className="text-sm text-gray-500">
                            USER EMAIL
                          </Form.Label>
                          <Form.Control>
                            <Input
                              type="email"
                              {...field}
                              placeholder="Enter email"
                              disabled={isReadOnly}
                              readOnly={isReadOnly}
                            />
                          </Form.Control>
                        </div>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={control}
                    name="beginBillNumber"
                    render={({ field }) => (
                      <Form.Item>
                        <div className="space-y-2">
                          <Form.Label className="text-sm text-gray-500">
                            BEGIN BILL NUMBER
                          </Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              placeholder="Enter bill number"
                              disabled={isReadOnly}
                              readOnly={isReadOnly}
                            />
                          </Form.Control>
                        </div>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={control}
                    name="defaultPay"
                    render={({ field }) => (
                      <Form.Item>
                        <div className="space-y-2">
                          <Form.Label className="text-sm text-gray-500">
                            DEFAULTPAY
                          </Form.Label>
                          <Form.Control>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isReadOnly}
                            >
                              <Select.Trigger>
                                <Select.Value placeholder="Select..." />
                              </Select.Trigger>
                              <Select.Content>
                                {options.map((option) => (
                                  <Select.Item
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select>
                          </Form.Control>
                        </div>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Field
                    control={control}
                    name="account"
                    render={({ field }) => (
                      <Form.Item>
                        <div className="space-y-2">
                          <Form.Label className="text-sm text-gray-500">
                            ACCOUNT
                          </Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              placeholder="Enter account"
                              disabled={isReadOnly}
                              readOnly={isReadOnly}
                            />
                          </Form.Control>
                        </div>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />

                  <Form.Field
                    control={control}
                    name="location"
                    render={({ field }) => (
                      <Form.Item>
                        <div className="space-y-2">
                          <Form.Label className="text-sm text-gray-500">
                            LOCATION
                          </Form.Label>
                          <Form.Control>
                            <Input
                              {...field}
                              placeholder="Enter location"
                              disabled={isReadOnly}
                              readOnly={isReadOnly}
                            />
                          </Form.Control>
                        </div>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
