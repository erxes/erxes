import { IntegrationPanelForm } from '@/integrations/components/IntegrationPanelForm';
import { Button, Spinner } from 'erxes-ui';

export const SettingsPanelForm = IntegrationPanelForm;

export const SettingsPanelFooter = ({
  onCancel,
  cancelLabel,
  submitLabel,
  loading = false,
  disabled = false,
}: {
  onCancel: () => void;
  cancelLabel: string;
  submitLabel: string;
  loading?: boolean;
  disabled?: boolean;
}) => (
  <div className="mt-auto flex shrink-0 justify-end gap-2 border-t p-3">
    <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
      {cancelLabel}
    </Button>
    <Button type="submit" disabled={loading || disabled}>
      {loading && <Spinner size="sm" />}
      {submitLabel}
    </Button>
  </div>
);
