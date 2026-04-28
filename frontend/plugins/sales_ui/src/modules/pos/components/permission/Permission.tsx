import { useCallback, useEffect, type ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Form, InfoCard, Label, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { AdminPermissions } from '@/pos/components/permission/AdminPermissions';
import { CashierPermissions } from '@/pos/components/permission/CashierPermissions';
import mutations from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { cleanData } from '@/pos/utils/cleanData';

interface PermissionProps {
  posId?: string;
  posType?: string;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

export interface PermissionFormData {
  adminIds: string[];
  adminIsPrintTempBill: boolean;
  adminDirectDiscount: boolean;
  adminDirectDiscountLimit: string;
  cashierIds: string[];
  cashierIsPrintTempBill: boolean;
  cashierDirectDiscount: boolean;
  cashierDirectDiscountLimit: string;
}

const PERMISSION_FORM_ID = 'pos-permission-form';

const DEFAULT_FORM_VALUES: PermissionFormData = {
  adminIds: [],
  adminIsPrintTempBill: false,
  adminDirectDiscount: false,
  adminDirectDiscountLimit: '',
  cashierIds: [],
  cashierIsPrintTempBill: false,
  cashierDirectDiscount: false,
  cashierDirectDiscountLimit: '',
};

const parseLimit = (value: string): number => {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const Permission: React.FC<PermissionProps> = ({
  posId,
  onSaveActionChange,
}) => {
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const form = useForm<PermissionFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const { control, handleSubmit, reset, formState } = form;
  const { isDirty } = formState;

  useEffect(() => {
    if (!posDetail) {
      return;
    }

    const adminConfig = posDetail.permissionConfig?.admins;
    const cashierConfig = posDetail.permissionConfig?.cashiers;

    reset({
      adminIds: posDetail.adminIds || [],
      adminIsPrintTempBill: adminConfig?.isTempBill ?? false,
      adminDirectDiscount: adminConfig?.directDiscount ?? false,
      adminDirectDiscountLimit:
        adminConfig?.directDiscountLimit?.toString() || '',
      cashierIds: posDetail.cashierIds || [],
      cashierIsPrintTempBill: cashierConfig?.isTempBill ?? false,
      cashierDirectDiscount: cashierConfig?.directDiscount ?? false,
      cashierDirectDiscountLimit:
        cashierConfig?.directDiscountLimit?.toString() || '',
    });
  }, [posDetail, reset]);

  const handleSaveChanges = useCallback(
    async (data: PermissionFormData) => {
      if (!posId) {
        toast({
          title: 'Error',
          description: 'POS ID is required',
          variant: 'destructive',
        });
        return;
      }

      const currentPermissionConfig = cleanData(
        posDetail?.permissionConfig || {},
      );

      try {
        await posEdit({
          variables: {
            _id: posId,
            adminIds: data.adminIds,
            cashierIds: data.cashierIds,
            permissionConfig: {
              ...currentPermissionConfig,
              admins: {
                isTempBill: data.adminIsPrintTempBill,
                directDiscount: data.adminDirectDiscount,
                directDiscountLimit: parseLimit(
                  data.adminDirectDiscountLimit,
                ),
              },
              cashiers: {
                isTempBill: data.cashierIsPrintTempBill,
                directDiscount: data.cashierDirectDiscount,
                directDiscountLimit: parseLimit(
                  data.cashierDirectDiscountLimit,
                ),
              },
            },
          },
        });

        toast({
          title: 'Success',
          description: 'Permissions saved successfully',
        });
        reset(data);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to save permissions',
          variant: 'destructive',
        });
      }
    },
    [
      posDetail?.permissionConfig,
      posEdit,
      posId,
      reset,
    ],
  );

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      isDirty ? (
        <Button
          type="submit"
          form={PERMISSION_FORM_ID}
          size="sm"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [isDirty, onSaveActionChange, saving]);

  const renderContent = () => {
    if (detailLoading) {
      return (
        <div className="space-y-4">
          <div className="h-10 rounded animate-pulse bg-muted" />
          <div className="h-10 rounded animate-pulse bg-muted" />
          <div className="h-10 rounded animate-pulse bg-muted" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 text-center">
          <p className="text-destructive">
            Failed to load POS details: {error.message}
          </p>
        </div>
      );
    }

    return (
      <Form {...form}>
        <form
          id={PERMISSION_FORM_ID}
          onSubmit={handleSubmit(handleSaveChanges)}
          className="space-y-8"
        >
          <section className="space-y-4">
            <Label>Admins</Label>

            <AdminPermissions control={control} />
          </section>

          <section className="pt-6 space-y-4 border-t">
            <Label>Cashiers</Label>

            <CashierPermissions control={control} />
          </section>
        </form>
      </Form>
    );
  };

  return (
    <div className="p-6">
      <InfoCard title="Permission configuration">
        <InfoCard.Content>{renderContent()}</InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export default Permission;
