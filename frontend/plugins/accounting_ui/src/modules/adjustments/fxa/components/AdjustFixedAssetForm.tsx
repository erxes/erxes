import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AdjustDateField,
  AdjustDescriptionField,
} from '@/adjustments/components/AdjustPanelFields';
import { ADJUST_FIXED_ASSET_CONTENT_TYPE } from '@/adjustments/constants/adjustmentPanel';
import { useAdjustFixedAssetAdd } from '@/adjustments/fxa/hooks/useAdjustFixedAssetAdd';
import {
  adjustFixedAssetSchema,
  TAdjustFixedAssetForm,
} from '@/adjustments/fxa/types/adjustFixedAssetSchema';
import { SettingsPanelAddButton } from '@/settings/components/panel/SettingsPanelActions';
import {
  ISettingsPanelViews,
  SettingsPanelDraftForm,
} from '@/settings/components/panel/SettingsPanelLayout';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

export const AddAdjustFixedAsset = () => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={ADJUST_FIXED_ASSET_CONTENT_TYPE}
      label={t('add-fixed-asset-adjustment')}
    />
  );
};

const AdjustFixedAssetPanelNew = () => {
  const { cancelDraft } = useSettingsPanel(ADJUST_FIXED_ASSET_CONTENT_TYPE);
  const { addAdjustFixedAsset, loading } = useAdjustFixedAssetAdd();
  const form = useForm<TAdjustFixedAssetForm>({
    resolver: zodResolver(adjustFixedAssetSchema),
    defaultValues: { date: new Date(), description: '' },
  });

  const handleSubmit = (data: TAdjustFixedAssetForm) => {
    addAdjustFixedAsset({ variables: data });
  };

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={cancelDraft}
      saving={loading}
    >
      <AdjustDateField control={form.control} required />
      <AdjustDescriptionField control={form.control} />
    </SettingsPanelDraftForm>
  );
};

const AdjustFixedAssetPanelDetail = () => null;

export const ADJUST_FIXED_ASSET_PANEL: ISettingsPanelViews = {
  addLabel: 'add-fixed-asset-adjustment',
  editLabel: 'fixed-asset-adjustment-detail',
  New: AdjustFixedAssetPanelNew,
  Detail: AdjustFixedAssetPanelDetail,
};
