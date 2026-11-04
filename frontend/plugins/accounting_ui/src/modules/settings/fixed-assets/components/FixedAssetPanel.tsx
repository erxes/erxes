import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { isDeeplyEqual, Spinner, toast } from 'erxes-ui';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
} from '@/settings/components/panel/SettingsPanelLayout';
import { FIXED_ASSET_CONTENT_TYPE } from '@/settings/constants/settingsPanel';
import { FixedAssetForm } from '@/settings/fixed-assets/components/FixedAssetForm';
import { FIXED_ASSET_DEFAULT_VALUES } from '@/settings/fixed-assets/constants/defaultValues';
import { fixedAssetSchema } from '@/settings/fixed-assets/constants/schema';
import { useFixedAssetDetail } from '@/settings/fixed-assets/hooks/useFixedAssetDetail';
import {
  useFixedAssetAdd,
  useFixedAssetEdit,
} from '@/settings/fixed-assets/hooks/useFixedAssetMutations';
import { TFixedAssetForm } from '@/settings/fixed-assets/types/FixedAsset';
import { getUsefulLifeFromRate } from '@/settings/fixed-assets/utils/depreciationRate';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

const FixedAssetPanelNew = () => {
  const { cancelDraft, closePanel } = useSettingsPanel(
    FIXED_ASSET_CONTENT_TYPE,
  );
  const form = useForm<TFixedAssetForm>({
    resolver: zodResolver(fixedAssetSchema),
    defaultValues: FIXED_ASSET_DEFAULT_VALUES,
  });
  const { addFixedAsset, loading } = useFixedAssetAdd();

  const handleSubmit = (data: TFixedAssetForm) => {
    void addFixedAsset({
      variables: data,
      onCompleted: () => {
        form.reset();
        closePanel();
      },
    });
  };

  return (
    <FixedAssetForm
      form={form}
      handleSubmit={handleSubmit}
      onCancel={cancelDraft}
      loading={loading}
    />
  );
};

const FixedAssetPanelDetail = ({ contentId }: ISettingsPanelViewProps) => {
  const { t } = useTranslation('accounting');
  const { closePanel } = useSettingsPanel(FIXED_ASSET_CONTENT_TYPE);
  const { fixedAssetDetail, loading } = useFixedAssetDetail(contentId);
  const { editFixedAsset, loading: editLoading } = useFixedAssetEdit();
  const form = useForm<TFixedAssetForm>({
    resolver: zodResolver(fixedAssetSchema),
    defaultValues: FIXED_ASSET_DEFAULT_VALUES,
  });
  const { reset } = form;

  useEffect(() => {
    if (fixedAssetDetail) {
      const parsed = fixedAssetSchema.partial().safeParse({
        ...FIXED_ASSET_DEFAULT_VALUES,
        ...fixedAssetDetail,
        usefulLife: getUsefulLifeFromRate(
          fixedAssetDetail.annualDepreciationRate,
        ),
        taxUsefulLife: getUsefulLifeFromRate(
          fixedAssetDetail.taxAnnualDepreciationRate,
        ),
      });
      if (parsed.success) reset(parsed.data);
      else
        toast({
          title: t('error'),
          description: parsed.error.message,
          variant: 'destructive',
        });
    }
  }, [fixedAssetDetail, reset, t]);

  const handleSubmit = (data: TFixedAssetForm) => {
    if (!fixedAssetDetail?._id) return;
    const initialData = {
      ...FIXED_ASSET_DEFAULT_VALUES,
      ...fixedAssetDetail,
      usefulLife: getUsefulLifeFromRate(
        fixedAssetDetail?.annualDepreciationRate,
      ),
      taxUsefulLife: getUsefulLifeFromRate(
        fixedAssetDetail?.taxAnnualDepreciationRate,
      ),
    };

    if (isDeeplyEqual({ ...initialData, ...data }, initialData)) {
      reset();
      return closePanel();
    }

    void editFixedAsset({
      variables: {
        _id: fixedAssetDetail._id,
        ...data,
      },
      onCompleted: () => {
        closePanel();
        reset();
      },
    });
  };

  if (loading && !fixedAssetDetail) {
    return <Spinner containerClassName="py-12" />;
  }

  return (
    <FixedAssetForm
      form={form}
      handleSubmit={handleSubmit}
      onCancel={closePanel}
      loading={editLoading}
    />
  );
};

export const FIXED_ASSET_PANEL: ISettingsPanelViews = {
  addLabel: 'add-fixed-asset',
  editLabel: 'edit-fixed-asset',
  New: FixedAssetPanelNew,
  Detail: FixedAssetPanelDetail,
};
