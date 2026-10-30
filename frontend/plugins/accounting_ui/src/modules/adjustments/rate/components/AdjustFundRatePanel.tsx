import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner } from 'erxes-ui';
import { ADJUST_FUND_RATE_CONTENT_TYPE } from '@/adjustments/constants/adjustmentPanel';
import { AdjustFundRateForm } from '@/adjustments/rate/components/AdjustFundRateForm';
import { useAdjustFundRateAdd } from '@/adjustments/rate/hooks/useAdjustFundRateAdd';
import { useAdjustFundRateChange } from '@/adjustments/rate/hooks/useAdjustFundRateChange';
import { useAdjustFundRateDetail } from '@/adjustments/rate/hooks/useAdjustFundRateDetail';
import { IAdjustFundRate } from '@/adjustments/rate/types/AdjustFundRate';
import {
  adjustFundRateSchema,
  TAdjustFundRateForm,
} from '@/adjustments/rate/types/adjustFundRateSchema';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
} from '@/settings/components/panel/SettingsPanelLayout';
import { useCurrencyConfigs } from '@/settings/hooks/useCurrencyConfigs';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

const ADJUST_FUND_RATE_DEFAULT_VALUES: Omit<TAdjustFundRateForm, 'date'> = {
  mainCurrency: 'MNT',
  currency: '',
  spotRate: 0,
  description: '',
  gainAccountId: '',
  lossAccountId: '',
};

const AdjustFundRatePanelNew = () => {
  const { cancelDraft } = useSettingsPanel(ADJUST_FUND_RATE_CONTENT_TYPE);
  const { mainCurrency } = useCurrencyConfigs();
  const { addAdjustFundRate, loading } = useAdjustFundRateAdd();
  const form = useForm<TAdjustFundRateForm>({
    resolver: zodResolver(adjustFundRateSchema),
    defaultValues: { ...ADJUST_FUND_RATE_DEFAULT_VALUES, date: new Date() },
  });
  const { setValue } = form;

  useEffect(() => {
    if (mainCurrency) {
      setValue('mainCurrency', mainCurrency);
    }
  }, [mainCurrency, setValue]);

  const handleSubmit = (data: TAdjustFundRateForm) => {
    addAdjustFundRate({ variables: data });
  };

  return (
    <AdjustFundRateForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={cancelDraft}
      saving={loading}
    />
  );
};

const AdjustFundRateEditForm = ({
  adjustFundRate,
}: {
  adjustFundRate: IAdjustFundRate;
}) => {
  const { closePanel } = useSettingsPanel(ADJUST_FUND_RATE_CONTENT_TYPE);
  const { changeAdjustFundRate, loading } = useAdjustFundRateChange();
  const form = useForm<TAdjustFundRateForm>({
    resolver: zodResolver(adjustFundRateSchema),
    defaultValues: {
      mainCurrency: adjustFundRate.mainCurrency ?? '',
      currency: adjustFundRate.currency ?? '',
      spotRate: adjustFundRate.spotRate ?? 0,
      date: new Date(adjustFundRate.date ?? Date.now()),
      description: adjustFundRate.description ?? '',
      gainAccountId: adjustFundRate.gainAccountId ?? '',
      lossAccountId: adjustFundRate.lossAccountId ?? '',
    },
  });

  const handleSubmit = (data: TAdjustFundRateForm) =>
    changeAdjustFundRate({
      variables: { _id: adjustFundRate._id, ...data },
      onCompleted: closePanel,
    });

  return (
    <AdjustFundRateForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={closePanel}
      saving={loading}
    />
  );
};

const AdjustFundRatePanelDetail = ({ contentId }: ISettingsPanelViewProps) => {
  const { adjustFundRate, loading } = useAdjustFundRateDetail({
    variables: { _id: contentId },
  });

  if (!adjustFundRate) {
    return loading ? <Spinner containerClassName="py-12" /> : null;
  }

  return (
    <AdjustFundRateEditForm
      key={adjustFundRate._id}
      adjustFundRate={adjustFundRate}
    />
  );
};

export const ADJUST_FUND_RATE_PANEL: ISettingsPanelViews = {
  addLabel: 'Create Fund Rate Adjustment',
  editLabel: 'Edit Fund Rate Adjustment',
  New: AdjustFundRatePanelNew,
  Detail: AdjustFundRatePanelDetail,
};
