import { Button, Sheet, Spinner } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useSidePanel } from 'ui-modules';

/** Provides sheet context and form layout inside the shared settings panel. */
export const SettingsPanelForm = ({ children }: { children: ReactNode }) => {
  const { close } = useSidePanel();
  return (
    <Sheet open onOpenChange={(open) => !open && close()}>
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden [&_input:not([type=checkbox])]:h-7 [&_input]:text-xs">
        {children}
      </div>
    </Sheet>
  );
};

/** Renders cancel and submit actions with loading and disabled states. */
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
