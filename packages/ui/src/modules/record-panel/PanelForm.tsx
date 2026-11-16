import { IconForms, type Icon } from '@tabler/icons-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/button';
import { Spinner } from '../../components/spinner';
import { RecordTableInlineCell } from '../record-table/components/RecordTableCellInline';
import { PanelLabel } from './PanelLabel';

/**
 * One field of a form in the side panel, laid out like `PanelField`.
 * Icon and label, then the control, with its error, or else its hint, under it. A long label wraps to two lines (the
 * full text on hover) instead of being cut. `htmlFor` names the control by its id, so a click
 * on the label focuses it and a switch toggles.
 */
export const PanelFormRow = ({
  label,
  icon: Icon = IconForms,
  required,
  error,
  hint,
  htmlFor,
  children,
}: {
  label: React.ReactNode;
  icon?: Icon;
  required?: boolean;
  error?: string;
  /** What the field takes or does, under the control while it has no error. */
  hint?: React.ReactNode;
  /** The control's id. */
  htmlFor?: string;
  children: React.ReactNode;
}) => {
  const labelId = useId();
  const LabelTag = htmlFor ? 'label' : 'span';

  return (
    <div className="grid grid-cols-field items-start gap-x-2 gap-y-0.5">
      <LabelTag
        id={labelId}
        htmlFor={htmlFor}
        className="flex min-h-7 min-w-0 items-center gap-1.5 text-xs font-medium text-accent-foreground"
      >
        {/* By the first line of a label that wraps. */}
        <Icon className="mt-1.75 size-3.5 shrink-0 self-start" aria-hidden="true" />
        <PanelLabel tooltip={label}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </PanelLabel>
      </LabelTag>
      <div className="group/panel-value relative flex min-h-7 min-w-0 flex-col justify-center text-xs [&_button:not([role=switch])]:text-xs [&_input:placeholder-shown]:pl-7">
        <Icon
          className="pointer-events-none absolute left-2 top-1/2 z-1 hidden size-3.5 -translate-y-1/2 text-muted-foreground group-has-[input:placeholder-shown]/panel-value:block"
          aria-hidden="true"
        />
        {/* Pickers in the row are named by the label, then their value ("Category No category"). */}
        <RecordTableInlineCell.LabelledBy value={labelId}>
          {children}
        </RecordTableInlineCell.LabelledBy>
      </div>
      {error ? (
        <span role="alert" className="col-start-2 text-xs text-destructive">
          {error}
        </span>
      ) : (
        hint && <span className="col-start-2 text-xs text-muted-foreground">{hint}</span>
      )}
    </div>
  );
};

/**
 * A new record's form in the side panel: its rows, then Cancel and Save.
 * Nothing is saved until Save.
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
