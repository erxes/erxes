import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PanelLabel } from './PanelLabel';
import { IconForms, type Icon } from '@tabler/icons-react';

// Inputs inside a panel form row: the height and text of the panel's cells.
export const PANEL_INPUT_CLASS_NAME = 'h-7 rounded-sm text-xs shadow-none font-normal';

/**
 * One field of a record not created yet, laid out like `PanelField`: its
 * label, then the input, with the field's error under it.
 */
export const PanelFormRow = ({
  label,
  icon: Icon = IconForms,
  required,
  error,
  children,
}: {
  label: React.ReactNode;
  icon?: Icon;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="grid grid-cols-field items-center gap-x-2 gap-y-0.5 min-h-7">
    <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-accent-foreground">
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      <PanelLabel tooltip={label}>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </PanelLabel>
    </span>
    <div className="group/panel-value relative min-w-0 text-xs [&_button:not([role=switch])]:h-7 [&_button:not([role=switch])]:text-xs [&_input:placeholder-shown]:pl-7">
      <Icon
        className="pointer-events-none absolute left-2 top-1/2 z-1 hidden size-3.5 -translate-y-1/2 text-muted-foreground group-has-[input:placeholder-shown]/panel-value:block"
        aria-hidden="true"
      />
      {children}
    </div>
    {error && <span className="col-start-2 text-xs text-destructive">{error}</span>}
  </div>
);

/**
 * The body and footer of a new record's form in the side panel: its rows,
 * then Cancel and Save. Nothing is saved until Save.
 */
export const PanelFormLayout = ({
  children,
  onCancel,
  saving,
  saveLabel,
}: {
  children: React.ReactNode;
  onCancel: () => void;
  saving?: boolean;
  saveLabel?: string;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'side-panel' });

  return (
    <div className="flex flex-1 min-h-0 flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-1 p-3">{children}</div>
      </div>
      <div className="flex shrink-0 justify-end gap-1 border-t bg-background p-2">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button type="submit" size="sm" disabled={saving}>
          {saving && <Spinner size="sm" />}
          {saveLabel || t('save', 'Save')}
        </Button>
      </div>
    </div>
  );
};
