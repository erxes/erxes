import { PosSettingsSection } from '@/pos/components/pos-edit/PosSettingsSection';
import { usePosSettingsLabels } from '@/pos/hooks/usePosSettingsLabels';
import { PosSaveAction } from '@/pos/components/pos-edit/PosSaveAction';
import { AdminPermissions } from '@/pos/components/permission/AdminPermissions';
import { CashierPermissions } from '@/pos/components/permission/CashierPermissions';
import { mutations } from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { cleanData } from '@/pos/utils/cleanData';
import { useMutation } from '@apollo/client';
import { Form, isDefined, toast } from 'erxes-ui';
import { useCallback, useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

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
  cashierSeeReport: boolean;
  cashierCreateCustomer: boolean;
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
  cashierSeeReport: false,
  cashierCreateCustomer: false,
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
  const { t } = useTranslation('sales');
  const labels = usePosSettingsLabels();
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
      adminIds: (posDetail.adminIds ?? []).filter(isDefined),
      adminIsPrintTempBill: adminConfig?.isTempBill ?? false,
      adminDirectDiscount: adminConfig?.directDiscount ?? false,
      adminDirectDiscountLimit:
        adminConfig?.directDiscountLimit?.toString() || '',
      cashierIds: (posDetail.cashierIds ?? []).filter(isDefined),
      cashierIsPrintTempBill: cashierConfig?.isTempBill ?? false,
      cashierSeeReport: cashierConfig?.seeReport ?? false,
      cashierCreateCustomer: cashierConfig?.createCustomer ?? false,
      cashierDirectDiscount: cashierConfig?.directDiscount ?? false,
      cashierDirectDiscountLimit:
        cashierConfig?.directDiscountLimit?.toString() || '',
    });
  }, [posDetail, reset]);

  const handleSaveChanges = useCallback(
    async (data: PermissionFormData) => {
      if (!posId) {
        toast({
          title: t('error'),
          description: t('pos-id-required'),
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
                directDiscountLimit: parseLimit(data.adminDirectDiscountLimit),
              },
              cashiers: {
                isTempBill: data.cashierIsPrintTempBill,
                seeReport: data.cashierSeeReport,
                createCustomer: data.cashierCreateCustomer,
                directDiscount: data.cashierDirectDiscount,
                directDiscountLimit: parseLimit(
                  data.cashierDirectDiscountLimit,
                ),
              },
            },
          },
        });

        toast({
          title: t('success'),
          description: t('permissions-saved'),
        });
        reset(data);
      } catch {
        toast({
          title: t('error'),
          description: t('failed-to-save-permissions'),
          variant: 'destructive',
        });
      }
    },
    [posDetail?.permissionConfig, posEdit, posId, reset],
  );

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      <PosSaveAction
        isDirty={isDirty}
        saving={saving}
        form={PERMISSION_FORM_ID}
      />,
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
            {t('failed-to-load-pos-details', { message: error.message })}
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
          <PosSettingsSection
            title={t('admins')}
            description={labels.adminsDescription}
          >
            <AdminPermissions control={control} />
          </PosSettingsSection>

          <PosSettingsSection
            separated
            title={t('cashiers')}
            description={labels.cashiersDescription}
          >
            <CashierPermissions control={control} />
          </PosSettingsSection>
        </form>
      </Form>
    );
  };

  return <>{renderContent()}</>;
};

export { Permission };
