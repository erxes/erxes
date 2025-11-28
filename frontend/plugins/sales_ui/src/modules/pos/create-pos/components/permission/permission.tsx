import { Input, Switch, Form } from 'erxes-ui';
import { SelectMember } from 'ui-modules';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PermissionFormValues, permissionSchema } from '../formSchema';
import {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react';
import { IPosDetail } from '@/pos/pos-detail/types/IPos';

interface PermissionFormProps {
  form?: UseFormReturn<PermissionFormValues>;
  onFormSubmit?: (data: PermissionFormValues) => void;
  // New alias prop to match PosEdit usage
  onSubmit?: (data: PermissionFormValues) => void;
  posDetail?: IPosDetail;
}

export interface PermissionFormRef {
  getAdminIds: () => string[];
  getCashierIds: () => string[];
}

const PermissionForm = forwardRef<PermissionFormRef, PermissionFormProps>(
  ({ form: externalForm, onFormSubmit, onSubmit, posDetail }, ref) => {
    const [selectedAdminIds, setSelectedAdminIds] = useState<string[]>([]);
    const [selectedCashierIds, setSelectedCashierIds] = useState<string[]>([]);

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
      if (!posDetail) return;

      const adminIds =
        posDetail.adminIds ||
        (posDetail.adminTeamMember ? [posDetail.adminTeamMember] : []);
      const cashierIds =
        posDetail.cashierIds ||
        (posDetail.cashierTeamMember ? [posDetail.cashierTeamMember] : []);

      const pc = posDetail.permissionConfig || {};
      const adminsCfg = pc.admins || pc.admin || {};
      const cashiersCfg = pc.cashiers || pc.cashier || {};

      const adminPrintTempBill =
        adminsCfg.isTempBill ?? posDetail.adminPrintTempBill ?? false;
      const adminDirectDiscountLimit =
        adminsCfg.directDiscountLimit ??
        posDetail.adminDirectDiscountLimit ??
        '';
      const adminDirectSales =
        adminsCfg.directDiscount ?? posDetail.adminDirectSales ?? false;

      const cashierPrintTempBill =
        cashiersCfg.isTempBill ?? posDetail.cashierPrintTempBill ?? false;
      const cashierDirectDiscountLimit =
        cashiersCfg.directDiscountLimit ??
        posDetail.cashierDirectDiscountLimit ??
        '';
      const cashierDirectSales =
        cashiersCfg.directDiscount ?? posDetail.cashierDirectSales ?? false;

      setSelectedAdminIds(adminIds);
      setSelectedCashierIds(cashierIds);
      form.reset({
        adminTeamMember: adminIds[0] || '',
        adminPrintTempBill: Boolean(adminPrintTempBill),
        adminDirectSales: Boolean(adminDirectSales),
        adminDirectDiscountLimit: String(adminDirectDiscountLimit || ''),
        cashierTeamMember: cashierIds[0] || '',
        cashierPrintTempBill: Boolean(cashierPrintTempBill),
        cashierDirectSales: Boolean(cashierDirectSales),
        cashierDirectDiscountLimit: String(cashierDirectDiscountLimit || ''),
        adminIds: adminIds,
        cashierIds: cashierIds,
        permissionConfig: posDetail.permissionConfig || {},
      });
    }, [posDetail, form]);

    const getAdminIds = useCallback((): string[] => {
      const formAdminIds = form.getValues('adminIds') || [];
      return selectedAdminIds.length > 0 ? selectedAdminIds : formAdminIds;
    }, [form, selectedAdminIds]);

    const getCashierIds = useCallback((): string[] => {
      const formCashierIds = form.getValues('cashierIds') || [];
      return selectedCashierIds.length > 0
        ? selectedCashierIds
        : formCashierIds;
    }, [form, selectedCashierIds]);

    useImperativeHandle(ref, () => ({
      getAdminIds,
      getCashierIds,
    }));

    const transformFormData = useCallback(
      (values: PermissionFormValues): PermissionFormValues => {
        const adminIds = getAdminIds();
        const cashierIds = getCashierIds();

        return {
          ...values,
          adminIds,
          cashierIds,
          permissionConfig: {
            admins: {
              isTempBill: values.adminPrintTempBill || false,
              directDiscount:
                Boolean(values.adminDirectSales) ||
                Number(values.adminDirectDiscountLimit || 0) > 0,
              directDiscountLimit: Number(values.adminDirectDiscountLimit || 0),
            },
            cashiers: {
              isTempBill: values.cashierPrintTempBill || false,
              directDiscount:
                Boolean(values.cashierDirectSales) ||
                Number(values.cashierDirectDiscountLimit || 0) > 0,
              directDiscountLimit: Number(
                values.cashierDirectDiscountLimit || 0,
              ),
            },
          },
        };
      },
      [getAdminIds, getCashierIds],
    );

    useEffect(() => {
      if (!onFormSubmit) return;
      const subscription = form.watch((values) => {
        if (values) {
          const transformedData = transformFormData(
            values as PermissionFormValues,
          );
          onFormSubmit(transformedData);
        }
      });

      return () => subscription.unsubscribe();
    }, [form, onFormSubmit, transformFormData]);

    const handleSubmit = async (data: PermissionFormValues) => {
      const transformedData = transformFormData(data);
      const handler = onFormSubmit || onSubmit;
      if (handler) {
        handler(transformedData);
      }
    };

    const handleAdminMemberChange = (value: string | string[] | null) => {
      const userIds = Array.isArray(value) ? value : value ? [value] : [];

      setSelectedAdminIds(userIds);
      form.setValue('adminTeamMember', userIds[0] || '', {
        shouldValidate: true,
      });
      form.setValue('adminIds', userIds, {
        shouldValidate: true,
      });
    };

    const handleCashierMemberChange = (value: string | string[] | null) => {
      const userIds = Array.isArray(value) ? value : value ? [value] : [];

      setSelectedCashierIds(userIds);
      form.setValue('cashierTeamMember', userIds[0] || '', {
        shouldValidate: true,
      });
      form.setValue('cashierIds', userIds, {
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
                <h2 className="text-lg font-semibold text-primary">ADMINS</h2>

                {/* <p className="text-xs font-semibold text-muted-foreground">
                  POS ADMIN
                </p> */}
              </div>

              <Form.Field
                control={form.control}
                name="adminIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-sm">
                      Select admin team members
                    </Form.Label>
                    <Form.Control>
                      <SelectMember
                        mode="multiple"
                        value={selectedAdminIds}
                        onValueChange={handleAdminMemberChange}
                        className="justify-start w-full"
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
                      <div className="flex flex-col gap-4">
                        <Form.Label className="text-sm font-medium uppercase">
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
                      <div className="flex flex-col gap-4">
                        <Form.Label className="text-sm font-medium uppercase">
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
                      <Form.Label className="text-sm">
                        DIRECT DISCOUNT LIMIT
                      </Form.Label>
                      <Form.Control>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Write here"
                          className="h-8"
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}
            </div>

            <div className="pt-6 space-y-4 border-t">
              <div className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold text-primary">Cashiers</h2>

                {/* <p className="text-xs font-semibold text-muted-foreground">
                  Pos Cashier
                </p> */}
              </div>

              <Form.Field
                control={form.control}
                name="cashierIds"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label className="text-sm">
                      Choose cashier team members
                    </Form.Label>
                    <Form.Control>
                      <SelectMember
                        mode="multiple"
                        value={selectedCashierIds}
                        onValueChange={handleCashierMemberChange}
                        className="justify-start w-full"
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
                      <div className="flex flex-col gap-4">
                        <Form.Label className="text-sm font-medium uppercase">
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
                      <div className="flex flex-col gap-4">
                        <Form.Label className="text-sm font-medium uppercase">
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
                      <Form.Label className="text-sm">
                        DIRECT DISCOUNT LIMIT
                      </Form.Label>
                      <Form.Control>
                        <Input
                          {...field}
                          type="number"
                          placeholder="Write here"
                          className="h-8"
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
  const adminIds =
    values.adminIds || (values.adminTeamMember ? [values.adminTeamMember] : []);
  const cashierIds =
    values.cashierIds ||
    (values.cashierTeamMember ? [values.cashierTeamMember] : []);

  return {
    ...values,
    adminIds,
    cashierIds,
    permissionConfig: {
      admins: {
        isTempBill: values.adminPrintTempBill || false,
        directDiscount:
          Boolean(values.adminDirectSales) ||
          Number(values.adminDirectDiscountLimit || 0) > 0,
        directDiscountLimit: Number(values.adminDirectDiscountLimit || 0),
      },
      cashiers: {
        isTempBill: values.cashierPrintTempBill || false,
        directDiscount:
          Boolean(values.cashierDirectSales) ||
          Number(values.cashierDirectDiscountLimit || 0) > 0,
        directDiscountLimit: Number(values.cashierDirectDiscountLimit || 0),
      },
    },
  };
};
