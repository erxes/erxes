import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from 'erxes-ui';
import { PanelFormRow, SelectCategory } from 'ui-modules';
import {
  AdjustBranchDepartmentFields,
  AdjustDateField,
  AdjustDescriptionField,
} from '@/adjustments/components/AdjustPanelFields';
import { SAFE_REMAINDER_CONTENT_TYPE } from '@/inventories/safeRemainders/constants/safeRemainderPanel';
import { useSafeRemainderAdd } from '@/inventories/safeRemainders/hooks/useSafeRemainderAdd';
import { TSafeRemainderForm } from '@/inventories/safeRemainders/types/safeRemainderForm';
import { safeRemainderSchema } from '@/inventories/safeRemainders/types/safeRemainderSchema';
import { SettingsPanelAddButton } from '@/settings/components/panel/SettingsPanelActions';
import {
  ISettingsPanelViews,
  SettingsPanelDraftForm,
} from '@/settings/components/panel/SettingsPanelLayout';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

const SCOPE = 'side-panel-safe-remainder';

export const AddSafeRemainder = () => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={SAFE_REMAINDER_CONTENT_TYPE}
      label={t('add-safe-remainder')}
    />
  );
};

const SafeRemainderPanelNew = () => {
  const { t } = useTranslation('accounting');
  const { cancelDraft } = useSettingsPanel(SAFE_REMAINDER_CONTENT_TYPE);
  const { addSafeRemainder, loading } = useSafeRemainderAdd();
  const form = useForm<TSafeRemainderForm>({
    resolver: zodResolver(safeRemainderSchema),
    defaultValues: { date: new Date() },
  });

  const handleSubmit = (data: TSafeRemainderForm) => {
    addSafeRemainder({ variables: data });
  };

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={handleSubmit}
      onCancel={cancelDraft}
      saving={loading}
    >
      <AdjustDateField control={form.control} required />
      <AdjustBranchDepartmentFields control={form.control} scope={SCOPE} />
      <Form.Field
        control={form.control}
        name="productCategoryId"
        render={({ field }) => (
          <PanelFormRow label={t('product-category')}>
            <SelectCategory.InlineCell
              mode="single"
              scope={`${SCOPE}.productCategory`}
              value={field.value ?? ''}
              onValueChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />
      <AdjustDescriptionField control={form.control} />
    </SettingsPanelDraftForm>
  );
};

const SafeRemainderPanelDetail = () => null;

export const SAFE_REMAINDER_PANEL: ISettingsPanelViews = {
  addLabel: 'add-safe-remainder',
  editLabel: 'inventory-census-detail',
  New: SafeRemainderPanelNew,
  Detail: SafeRemainderPanelDetail,
};
