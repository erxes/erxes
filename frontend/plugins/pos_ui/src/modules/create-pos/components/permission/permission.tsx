import { Input, Switch, Form } from 'erxes-ui';
import { SelectMember } from 'ui-modules';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PermissionFormValues, permissionSchema } from '../formSchema';
import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { IPosDetail } from '@/pos-detail/types/IPos';

interface PermissionFormProps {
  form?: UseFormReturn<PermissionFormValues>;
  onFormSubmit?: (data: PermissionFormValues) => void;
  posDetail?: IPosDetail;
}

export interface PermissionFormRef {
  getAdminIds: () => string[];
  getCashierIds: () => string[];
}

const PermissionForm = forwardRef<PermissionFormRef, PermissionFormProps>(
  ({ form: externalForm, onFormSubmit, posDetail }, ref) => {
    const [selectedAdminId, setSelectedAdminId] = useState<string>('');
    const [selectedCashierId, setSelectedCashierId] = useState<string>('');

    const internalForm = useForm<PermissionFormValues>({
      resolver: zodResolver(permissionSchema),
      defaultValues: {
        adminTeamMember: '',
        adminPrintTempBill: false,
        adminDirectSales: false,
        adminDirectDiscountLimit: '',
        cashierTeamMember: '',
        cashierPrintTempBill: false,
        cashierDirectSales: false,
        cashierDirectDiscountLimit: '',
        adminIds: [],
        cashierIds: [],
        permissionConfig: {},
      },
    });

    const form = externalForm || internalForm;

    const watchAdminDirectSales = form.watch('adminDirectSales');
    const watchCashierDirectSales = form.watch('cashierDirectSales');

    useEffect(() => {
      if (posDetail) {
        const adminId =
          posDetail.adminTeamMember || posDetail.adminIds?.[0] || '';
        const cashierId =
          posDetail.cashierTeamMember || posDetail.cashierIds?.[0] || '';

        setSelectedAdminId(adminId);
        setSelectedCashierId(cashierId);
        form.reset({
          adminTeamMember: adminId,
          adminPrintTempBill: posDetail.adminPrintTempBill || false,
          adminDirectSales: posDetail.adminDirectSales || false,
          adminDirectDiscountLimit: posDetail.adminDirectDiscountLimit || '',
          cashierTeamMember: cashierId,
          cashierPrintTempBill: posDetail.cashierPrintTempBill || false,
          cashierDirectSales: posDetail.cashierDirectSales || false,
          cashierDirectDiscountLimit:
            posDetail.cashierDirectDiscountLimit || '',
          adminIds: adminId ? [adminId] : [],
          cashierIds: cashierId ? [cashierId] : [],
          permissionConfig: posDetail.permissionConfig || {},
        });
      }
    }, [posDetail, form]);

    const getAdminIds = (): string[] => {
      const formAdminIds = form.getValues('adminIds') || [];
      const currentAdminId =
        selectedAdminId || form.getValues('adminTeamMember');

      if (currentAdminId && !formAdminIds.includes(currentAdminId)) {
        return [currentAdminId];
      }
      return formAdminIds.length > 0
        ? formAdminIds
        : currentAdminId
        ? [currentAdminId]
        : [];
    };

    const getCashierIds = (): string[] => {
      const formCashierIds = form.getValues('cashierIds') || [];
      const currentCashierId =
        selectedCashierId || form.getValues('cashierTeamMember');

      if (currentCashierId && !formCashierIds.includes(currentCashierId)) {
        return [currentCashierId];
      }
      return formCashierIds.length > 0
        ? formCashierIds
        : currentCashierId
        ? [currentCashierId]
        : [];
    };

    useImperativeHandle(ref, () => ({
      getAdminIds,
      getCashierIds,
    }));

    const transformFormData = (
      values: PermissionFormValues,
    ): PermissionFormValues => {
      const adminIds = getAdminIds();
      const cashierIds = getCashierIds();

      return {
        ...values,
        adminIds,
        cashierIds,
        permissionConfig: {
          admin: {
            printTempBill: values.adminPrintTempBill || false,
            directSales: values.adminDirectSales || false,
            directDiscountLimit: values.adminDirectDiscountLimit || '',
          },
          cashier: {
            printTempBill: values.cashierPrintTempBill || false,
            directSales: values.cashierDirectSales || false,
            directDiscountLimit: values.cashierDirectDiscountLimit || '',
          },
        },
      };
    };

    useEffect(() => {
      if (onFormSubmit) {
        const subscription = form.watch((values) => {
          if (values) {
            const transformedData = transformFormData(
              values as PermissionFormValues,
            );
            onFormSubmit(transformedData);
          }
        });

        return () => subscription.unsubscribe();
      }
    }, [form, onFormSubmit, selectedAdminId, selectedCashierId]);

    const handleSubmit = async (data: PermissionFormValues) => {
      const transformedData = transformFormData(data);
      if (onFormSubmit) {
        onFormSubmit(transformedData);
      }
    };

    const handleAdminMemberChange = (value: string | string[]) => {
      const userId = Array.isArray(value) ? value[0] : value;
      const finalUserId = userId || '';

      setSelectedAdminId(finalUserId);
      form.setValue('adminTeamMember', finalUserId, { shouldValidate: true });
      form.setValue('adminIds', finalUserId ? [finalUserId] : [], {
        shouldValidate: true,
      });
    };

    const handleCashierMemberChange = (value: string | string[]) => {
      const userId = Array.isArray(value) ? value[0] : value;
      const finalUserId = userId || '';

      setSelectedCashierId(finalUserId);
      form.setValue('cashierTeamMember', finalUserId, { shouldValidate: true });
      form.setValue('cashierIds', finalUserId ? [finalUserId] : [], {
        shouldValidate: true,
      });
    };

    return (
      <div className="p-3">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <h2 className="text-[#4F46E5] text-lg font-semibold">ADMINS</h2>
                <p className="text-[#A1A1AA] text-xs font-semibold">
                  POS ADMIN
                </p>
              </div>

              <Form.Field
                control={form.control}
                name="adminTeamMember"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-gray-600">
                      Select admin team member
                    </Form.Label>
                    <Form.Control>
                      <SelectMember
                        value={selectedAdminId || undefined}
                        onValueChange={handleAdminMemberChange}
                        className="w-full justify-start bg-white hover:bg-gray-50"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <div className="flex gap-8">
                <Form.Field
                  control={form.control}
                  name="adminPrintTempBill"
                  render={({ field }) => (
                    <Form.Item>
                      <div className="flex gap-4 flex-col">
                        <Form.Label className="text-[#71717A] text-sm font-medium uppercase">
                          IS PRINT TEMP BILL
                        </Form.Label>
                        <Form.Control>
                          <Switch
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </Form.Control>
                      </div>
                      <Form.Message />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={form.control}
                  name="adminDirectSales"
                  render={({ field }) => (
                    <Form.Item>
                      <div className="flex gap-4 flex-col">
                        <Form.Label className="text-[#71717A] text-sm font-medium uppercase">
                          DIRECT SALES
                        </Form.Label>
                        <Form.Control>
                          <Switch
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </Form.Control>
                      </div>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>

              {watchAdminDirectSales && (
                <Form.Field
                  control={form.control}
                  name="adminDirectDiscountLimit"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label className="text-gray-500 text-sm">
                        DIRECT DISCOUNT LIMIT
                      </Form.Label>
                      <Form.Control>
                        <Input
                          {...field}
                          placeholder="Write here"
                          className="h-10"
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}
            </div>

            <div className="space-y-4 pt-6 border-t">
              <div className="flex flex-col gap-3">
                <h2 className="text-[#4F46E5] text-lg font-semibold">
                  Cashiers
                </h2>
                <p className="text-[#A1A1AA] text-xs font-semibold">
                  Pos Cashier
                </p>
              </div>

              <Form.Field
                control={form.control}
                name="cashierTeamMember"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-gray-600">
                      Choose cashier team member
                    </Form.Label>
                    <Form.Control>
                      <SelectMember
                        value={selectedCashierId || undefined}
                        onValueChange={handleCashierMemberChange}
                        className="w-full justify-start bg-white hover:bg-gray-50"
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <div className="flex gap-8">
                <Form.Field
                  control={form.control}
                  name="cashierPrintTempBill"
                  render={({ field }) => (
                    <Form.Item>
                      <div className="flex gap-4 flex-col">
                        <Form.Label className="text-[#71717A] text-sm font-medium uppercase">
                          IS PRINT TEMP BILL
                        </Form.Label>
                        <Form.Control>
                          <Switch
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </Form.Control>
                      </div>
                      <Form.Message />
                    </Form.Item>
                  )}
                />

                <Form.Field
                  control={form.control}
                  name="cashierDirectSales"
                  render={({ field }) => (
                    <Form.Item>
                      <div className="flex gap-4 flex-col">
                        <Form.Label className="text-[#71717A] text-sm font-medium uppercase">
                          DIRECT SALES
                        </Form.Label>
                        <Form.Control>
                          <Switch
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                          />
                        </Form.Control>
                      </div>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>

              {watchCashierDirectSales && (
                <Form.Field
                  control={form.control}
                  name="cashierDirectDiscountLimit"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label className="text-gray-500 text-sm">
                        DIRECT DISCOUNT LIMIT
                      </Form.Label>
                      <Form.Control>
                        <Input
                          {...field}
                          placeholder="Write here"
                          className="h-10"
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}
            </div>
          </form>
        </Form>
      </div>
    );
  },
);

PermissionForm.displayName = 'PermissionForm';

export default PermissionForm;

export const getPermissionFormIds = (
  formRef: React.RefObject<PermissionFormRef>,
) => {
  if (!formRef.current) return { adminIds: [], cashierIds: [] };

  return {
    adminIds: formRef.current.getAdminIds() || [],
    cashierIds: formRef.current.getCashierIds() || [],
  };
};

export const getPermissionFormValues = (
  form: UseFormReturn<PermissionFormValues>,
) => {
  const values = form.getValues();
  return {
    ...values,
    adminIds:
      values.adminIds ||
      (values.adminTeamMember ? [values.adminTeamMember] : []),
    cashierIds:
      values.cashierIds ||
      (values.cashierTeamMember ? [values.cashierTeamMember] : []),
  };
};
