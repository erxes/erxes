import { useCallback, useEffect, type ReactNode } from 'react';
import { useMutation } from '@apollo/client';
import { Button, Form, InfoCard, Label, toast } from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { Main } from '@/pos/components/financeConfig/Main';
import { Remainder } from '@/pos/components/financeConfig/Remainder';
import { isFieldVisible } from '@/pos/constants';
import mutations from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';
import { cleanData } from '@/pos/utils/cleanData';
import { PaymentType } from '@/pos/types/types';

interface FinanceConfigProps {
  posId?: string;
  posType?: string;
  onSaveActionChange?: (action: ReactNode | null) => void;
}

export interface FinanceConfigFormData {
  isSyncErkhet: boolean;
  userEmail: string;
  beginNumber: string;
  defaultPay: string;
  account: string;
  location: string;
  getRemainder: boolean;
  checkErkhet: boolean;
  checkInventories: boolean;
  paymentTypeConfigs: Record<string, string>;
}

const FINANCE_CONFIG_FORM_ID = 'pos-finance-config-form';

const DEFAULT_FORM_VALUES: FinanceConfigFormData = {
  isSyncErkhet: false,
  userEmail: '',
  beginNumber: '',
  defaultPay: '',
  account: '',
  location: '',
  getRemainder: false,
  checkErkhet: false,
  checkInventories: false,
  paymentTypeConfigs: {},
};

const FinanceConfig: React.FC<FinanceConfigProps> = ({
  posId,
  posType,
  onSaveActionChange,
}) => {
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);
  const form = useForm<FinanceConfigFormData>({
    defaultValues: DEFAULT_FORM_VALUES,
  });
  const { control, handleSubmit, reset, formState, watch } = form;
  const { isDirty } = formState;

  const isSyncErkhet = watch('isSyncErkhet');
  const paymentTypes = (posDetail?.paymentTypes ?? []).filter(
    (pt): pt is PaymentType => !!pt._id,
  );

  useEffect(() => {
    if (!posDetail?.erkhetConfig) {
      return;
    }

    const config = posDetail.erkhetConfig;

    const ptConfigs: Record<string, string> = {};
    for (const key of Object.keys(config)) {
      if (key.startsWith('_')) {
        const val = config[key as keyof typeof config];
        if (typeof val === 'string') {
          ptConfigs[key] = val;
        }
      }
    }

    reset({
      isSyncErkhet: config.isSyncErkhet ?? false,
      userEmail: config.userEmail || '',
      beginNumber: config.beginNumber || '',
      defaultPay: config.defaultPay || '',
      account: config.account || '',
      location: config.location || '',
      getRemainder: config.getRemainder ?? false,
      checkErkhet: config.checkErkhet ?? false,
      checkInventories: config.checkInventories ?? false,
      paymentTypeConfigs: ptConfigs,
    });
  }, [posDetail, reset]);

  const handleSaveChanges = useCallback(
    async (data: FinanceConfigFormData) => {
      if (!posId) {
        toast({
          title: 'Error',
          description: 'POS ID is required',
          variant: 'destructive',
        });
        return;
      }

      if (data.isSyncErkhet) {
        const trimmedEmail = data.userEmail.trim();
        const atIndex = trimmedEmail.indexOf('@');
        const dotIndex = trimmedEmail.lastIndexOf('.');
        const isValidEmail =
          atIndex > 0 &&
          dotIndex > atIndex + 1 &&
          dotIndex < trimmedEmail.length - 1 &&
          !trimmedEmail.includes(' ');
        if (!trimmedEmail || !isValidEmail) {
          toast({
            title: 'Invalid email',
            description: 'Please enter a valid email address.',
            variant: 'destructive',
          });
          return;
        }
      }

      try {
        const existingConfig = cleanData(posDetail?.erkhetConfig || {});

        await posEdit({
          variables: {
            _id: posId,
            erkhetConfig: {
              ...existingConfig,
              isSyncErkhet: data.isSyncErkhet,
              userEmail: data.userEmail,
              beginNumber: data.beginNumber,
              defaultPay: data.defaultPay,
              account: data.account,
              location: data.location,
              getRemainder: data.getRemainder,
              checkErkhet: data.checkErkhet,
              checkInventories: data.checkInventories,
              ...data.paymentTypeConfigs,
            },
          },
        });

        toast({
          title: 'Success',
          description: 'Finance config saved successfully',
        });
        reset(data);
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to save finance config',
          variant: 'destructive',
        });
      }
    },
    [posDetail?.erkhetConfig, posEdit, posId, reset],
  );

  useEffect(() => {
    if (!onSaveActionChange) {
      return;
    }

    onSaveActionChange(
      isDirty ? (
        <Button
          type="submit"
          form={FINANCE_CONFIG_FORM_ID}
          size="sm"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      ) : null,
    );

    return () => onSaveActionChange(null);
  }, [isDirty, onSaveActionChange, saving]);

  const canShowMain = isFieldVisible('erkhetSetup', posType);
  const canShowRemainder = isFieldVisible('remainderInventorySync', posType);

  const renderContent = () => {
    if (detailLoading) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <div className="w-24 h-4 rounded animate-pulse bg-muted" />
            <div className="w-12 h-6 rounded animate-pulse bg-muted" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-2">
                <div className="w-24 h-4 rounded animate-pulse bg-muted" />
                <div className="h-10 rounded animate-pulse bg-muted" />
              </div>
            ))}
          </div>
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
          id={FINANCE_CONFIG_FORM_ID}
          onSubmit={handleSubmit(handleSaveChanges)}
          className="space-y-8"
        >
          {canShowMain && (
            <section className="space-y-4">
              <Label>Main</Label>
              <Main
                control={control}
                isSyncErkhet={isSyncErkhet}
                paymentTypes={paymentTypes}
              />
            </section>
          )}

          {canShowRemainder && (
            <section className="pt-6 space-y-4 border-t">
              <Label>Remainder</Label>
              <Remainder control={control} />
            </section>
          )}
        </form>
      </Form>
    );
  };

  if (!canShowMain && !canShowRemainder) {
    return null;
  }

  return (
    <div className="p-6">
      <InfoCard title="Erkhet configuration">
        <InfoCard.Content>{renderContent()}</InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export default FinanceConfig;
