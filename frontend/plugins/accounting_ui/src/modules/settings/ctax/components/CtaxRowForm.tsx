import { UseFormReturn } from 'react-hook-form';
import {
  TCtaxRowForm,
  CtaxKind,
  CTAX_KIND_LABELS,
  CtaxStatus,
  CTAX_STATUS_LABELS,
} from '@/settings/ctax/types/CtaxRow';
import { TaxRowCommonFields } from '@/settings/components/TaxRowCommonFields';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';

export const CtaxRowForm = ({
  form,
  onSubmit,
  onCancel,
  saving,
}: {
  form: UseFormReturn<TCtaxRowForm>;
  onSubmit: (data: TCtaxRowForm) => void;
  onCancel: () => void;
  saving: boolean;
}) => (
  <SettingsPanelDraftForm
    form={form}
    onSubmit={onSubmit}
    onCancel={onCancel}
    saving={saving}
  >
    <TaxRowCommonFields
      control={form.control}
      kinds={Object.values(CtaxKind)}
      kindLabels={CTAX_KIND_LABELS}
      statuses={Object.values(CtaxStatus)}
      statusLabels={CTAX_STATUS_LABELS}
    />
  </SettingsPanelDraftForm>
);
