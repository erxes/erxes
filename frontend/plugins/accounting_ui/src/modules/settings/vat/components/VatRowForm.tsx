import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { PANEL_INPUT_CLASS_NAME, PanelFormRow } from 'ui-modules';
import {
  TVatRowForm,
  VatKind,
  VAT_KIND_LABELS,
  VatStatus,
  VAT_STATUS_LABELS,
} from '@/settings/vat/types/VatRow';
import { TaxRowCommonFields } from '@/settings/components/TaxRowCommonFields';
import { SettingsPanelSwitch } from '@/settings/components/panel/SettingsPanelFields';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';

export const VatRowForm = ({
  form,
  onSubmit,
  onCancel,
  saving,
}: {
  form: UseFormReturn<TVatRowForm>;
  onSubmit: (data: TVatRowForm) => void;
  onCancel: () => void;
  saving: boolean;
}) => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelDraftForm
      form={form}
      onSubmit={onSubmit}
      onCancel={onCancel}
      saving={saving}
    >
      <TaxRowCommonFields
        control={form.control}
        kinds={Object.values(VatKind)}
        kindLabels={VAT_KIND_LABELS}
        statuses={Object.values(VatStatus)}
        statusLabels={VAT_STATUS_LABELS}
      />

      <Form.Field
        control={form.control}
        name="tabCount"
        render={({ field, fieldState }) => (
          <PanelFormRow
            label={t('indentation-level')}
            required
            error={fieldState.error?.message}
          >
            <Input
              type="number"
              value={field.value ?? ''}
              onChange={(e) => field.onChange(Number(e.target.value))}
              min={0}
              placeholder={t('indentation-level')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
        )}
      />

      <Form.Field
        control={form.control}
        name="isBold"
        render={({ field }) => (
          <PanelFormRow label={t('bold-text')}>
            <SettingsPanelSwitch
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          </PanelFormRow>
        )}
      />
    </SettingsPanelDraftForm>
  );
};
