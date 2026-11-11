import { useTranslation } from 'react-i18next';
import { Form, Input } from 'erxes-ui';
import { PanelFormRow, PANEL_INPUT_CLASS_NAME } from 'ui-modules';
import { getFxaTaxLabel } from '@/adjustments/fxa/utils/fxaTaxLabels';
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
  const { t } = useTranslation('accounting');
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
      <Form.Field
        control={form.control}
        name="taxRate"
        render={({ field }) => (
          <PanelFormRow label={getFxaTaxLabel(t, 'income-tax-rate')} required>
            <Form.Control>
              <Input
                className={PANEL_INPUT_CLASS_NAME}
                type="number"
                min={0}
                max={100}
                step="any"
                placeholder={getFxaTaxLabel(t, 'income-tax-rate')}
                value={field.value ?? ''}
                onChange={(event) =>
                  field.onChange(
                    event.target.value === ''
                      ? undefined
                      : Number(event.target.value),
                  )
                }
              />
            </Form.Control>
            <Form.Message />
          </PanelFormRow>
        )}
      />
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
