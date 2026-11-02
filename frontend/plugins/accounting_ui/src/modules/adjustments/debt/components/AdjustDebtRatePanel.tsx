import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner } from 'erxes-ui';
import { ADJUST_DEBT_RATE_CONTENT_TYPE } from '@/adjustments/constants/adjustmentPanel';
import { AdjustDebtRateForm } from '@/adjustments/debt/components/AdjustDebtRateForm';
import { useAdjustDebtRateAdd } from '@/adjustments/debt/hooks/useAdjustDebtRateAdd';
import { useAdjustDebtRateChange } from '@/adjustments/debt/hooks/useAdjustDebtRateChange';
import { useAdjustDebtRateDetail } from '@/adjustments/debt/hooks/useAdjustDebtRateDetail';
import { IAdjustDebtRate } from '@/adjustments/debt/types/AdjustDebtRate';
import {
  adjustDebtRateSchema,
  TAdjustDebtRateForm,
} from '@/adjustments/debt/types/adjustDebtRateSchema';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
} from '@/settings/components/panel/SettingsPanelLayout';
import { useCurrencyConfigs } from '@/settings/hooks/useCurrencyConfigs';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

const ADJUST_DEBT_RATE_DEFAULT_VALUES: Omit<TAdjustDebtRateForm, 'date'> = {
  mainCurrency: 'MNT',
  currency: '',
  spotRate: 0,
  customerType: '',
  customerId: '',
  description: '',
  gainAccountId: '',
  lossAccountId: '',
  branchId: '',
  departmentId: '',
};

const AdjustDebtRatePanelNew = () => {
  const { cancelDraft, closePanel } = useSettingsPanel(
    ADJUST_DEBT_RATE_CONTENT_TYPE,
  );
  const { mainCurrency } = useCurrencyConfigs();
  const { addAdjustDebtRate, loading } = useAdjustDebtRateAdd();
  const form = useForm<TAdjustDebtRateForm>({
    resolver: zodResolver(adjustDebtRateSchema),
    defaultValues: { ...ADJUST_DEBT_RATE_DEFAULT_VALUES, date: new Date() },
  });
  const { setValue } = form;

  useEffect(() => {
    if (mainCurrency) {
      setValue('mainCurrency', mainCurrency);
    }
  }, [mainCurrency, setValue]);

  const handleSubmit = (data: TAdjustDebtRateForm) => {
    addAdjustDebtRate({ variables: data, onCompleted: closePanel });
  };

  return (
    <AdjustDebtRateForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={cancelDraft}
      saving={loading}
    />
  );
};

const AdjustDebtRateEditForm = ({
  adjustDebtRate,
}: {
  adjustDebtRate: IAdjustDebtRate;
}) => {
  const { closePanel } = useSettingsPanel(ADJUST_DEBT_RATE_CONTENT_TYPE);
  const { changeAdjustDebtRate, loading } = useAdjustDebtRateChange();
  const form = useForm<TAdjustDebtRateForm>({
    resolver: zodResolver(adjustDebtRateSchema),
    defaultValues: {
      mainCurrency: adjustDebtRate.mainCurrency ?? '',
      currency: adjustDebtRate.currency ?? '',
      spotRate: adjustDebtRate.spotRate ?? 0,
      date: new Date(adjustDebtRate.date ?? Date.now()),
      customerType: adjustDebtRate.customerType ?? '',
      customerId: adjustDebtRate.customerId ?? '',
      description: adjustDebtRate.description ?? '',
      gainAccountId: adjustDebtRate.gainAccountId ?? '',
      lossAccountId: adjustDebtRate.lossAccountId ?? '',
      branchId: adjustDebtRate.branchId ?? '',
      departmentId: adjustDebtRate.departmentId ?? '',
    },
  });

  const handleSubmit = (data: TAdjustDebtRateForm) =>
    changeAdjustDebtRate({
      variables: { _id: adjustDebtRate._id, ...data },
      onCompleted: closePanel,
    });

  return (
    <AdjustDebtRateForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={closePanel}
      saving={loading}
    />
  );
};

const AdjustDebtRatePanelDetail = ({ contentId }: ISettingsPanelViewProps) => {
  const { adjustDebtRate, loading } = useAdjustDebtRateDetail({
    variables: { _id: contentId },
  });

  if (!adjustDebtRate) {
    return loading ? <Spinner containerClassName="py-12" /> : null;
  }

  return (
    <AdjustDebtRateEditForm
      key={adjustDebtRate._id}
      adjustDebtRate={adjustDebtRate}
    />
  );
};

export const ADJUST_DEBT_RATE_PANEL: ISettingsPanelViews = {
  addLabel: 'Create Debt Rate Adjustment',
  editLabel: 'Edit Debt Rate Adjustment',
  New: AdjustDebtRatePanelNew,
  Detail: AdjustDebtRatePanelDetail,
};
