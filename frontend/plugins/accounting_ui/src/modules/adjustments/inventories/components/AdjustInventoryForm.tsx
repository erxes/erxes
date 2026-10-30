import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AdjustDateField,
  AdjustDescriptionField,
} from '@/adjustments/components/AdjustPanelFields';
import { ADJUST_INVENTORY_CONTENT_TYPE } from '@/adjustments/constants/adjustmentPanel';
import { useAdjustInventoryAdd } from '@/adjustments/inventories/hooks/useAdjustInventoryAdd';
import { TAdjustInventoryForm } from '@/adjustments/inventories/types/adjustInventoryForm';
import { adjustInventorySchema } from '@/adjustments/inventories/types/adjustInventorySchema';
import { SettingsPanelAddButton } from '@/settings/components/panel/SettingsPanelActions';
import {
  ISettingsPanelViews,
  SettingsPanelDraftForm,
} from '@/settings/components/panel/SettingsPanelLayout';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

export const AddAdjustInventory = () => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={ADJUST_INVENTORY_CONTENT_TYPE}
      label={t('add-inventory-adjustment')}
    />
  );
};

const AdjustInventoryPanelNew = () => {
  const { cancelDraft } = useSettingsPanel(ADJUST_INVENTORY_CONTENT_TYPE);
  const { addAdjustInventory, loading } = useAdjustInventoryAdd();
  const form = useForm<TAdjustInventoryForm>({
    resolver: zodResolver(adjustInventorySchema),
    defaultValues: { date: new Date() },
  });

  const handleSubmit = (data: TAdjustInventoryForm) => {
    addAdjustInventory({ variables: { ...data } });
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

const AdjustInventoryPanelDetail = () => null;

export const ADJUST_INVENTORY_PANEL: ISettingsPanelViews = {
  addLabel: 'add-inventory-adjustment',
  editLabel: 'inventory-adjustment-detail',
  New: AdjustInventoryPanelNew,
  Detail: AdjustInventoryPanelDetail,
};
