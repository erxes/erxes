import { IconForms, type Icon } from '@tabler/icons-react';
import { useEffect, useId, useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/button';
import { FieldControlContext } from '../../components/field-control';
import { Spinner } from '../../components/spinner';
import { useConfirm } from '../../hooks/use-confirm';
import { useFocusFirstField } from '../../hooks/use-focus-first-field';
import { isOverlayShown } from '../../hooks/use-page-hotkey';
import { RecordTableInlineCell } from '../record-table/components/RecordTableCellInline';
import { PanelLabel } from './PanelLabel';

/**
 * One field of a form in the side panel, laid out like `PanelField`.
 * Icon and label, then the control, with its error, or else its hint, under it. A long label wraps to two lines (the
 * full text on hover) instead of being cut. `htmlFor` names the control by its id, so a click
 * on the label focuses it and a switch toggles. The input, select or picker in the row is named
 * by the label and described by the error or hint, and marked invalid and required with it.
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
  const { t } = useTranslation('common', { keyPrefix: 'form' });
  const labelId = useId();
  const messageId = useId();
  const requiredNoteId = useId();
  const LabelTag = htmlFor ? 'label' : 'span';

  const field = {
    control: {
      'aria-labelledby': labelId,
      'aria-describedby': error || hint ? messageId : undefined,
      'aria-invalid': error ? true : undefined,
      'aria-required': required ? true : undefined,
    },
    requiredNoteId: required ? requiredNoteId : undefined,
  };

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
          {required && (
            <span aria-hidden="true" className="text-destructive-text">
              {' *'}
            </span>
          )}
        </PanelLabel>
      </LabelTag>
      <div className="group/panel-value relative flex min-h-7 min-w-0 flex-col justify-center text-xs [&_button:not([role=switch])]:text-xs [&_input]:text-xs [&_input:placeholder-shown]:pl-7">
        <Icon
          className="pointer-events-none absolute left-2 top-1/2 z-1 hidden size-3.5 -translate-y-1/2 text-muted-foreground group-has-[input:placeholder-shown]/panel-value:block"
          aria-hidden="true"
        />
        {/* Pickers in the row are named by the label, then their value ("Category No category"). */}
        <RecordTableInlineCell.LabelledBy value={labelId}>
          <FieldControlContext value={field}>{children}</FieldControlContext>
        </RecordTableInlineCell.LabelledBy>
      </div>
      {/* Read in a picker button's description, since a button can't be marked required. */}
      {required && (
        <span id={requiredNoteId} hidden>
          {t('required', 'Required')}
        </span>
      )}
      {error ? (
        <span id={messageId} role="alert" className="col-start-2 text-xs text-destructive-text">
          {error}
        </span>
      ) : (
        hint && (
          <span id={messageId} className="col-start-2 text-xs text-muted-foreground">
            {hint}
          </span>
        )
      )}
    </div>
  );
};

/**
 * Escape while focus is in the form leaves it, once the member agrees to drop what they typed.
 * Returns the ref for the form's root; `bodyRef` holds its fields. A picker, menu or dialog keeps
 * its own Escape: focus is in its popup then, outside the form.
 */
const useEscapeToCancel = (
  bodyRef: React.RefObject<HTMLDivElement | null>,
  onCancel: () => void,
  saving?: boolean,
) => {
  const { t } = useTranslation('common', { keyPrefix: 'form' });
  const { confirm } = useConfirm();
  const touched = useRef(false);

  // Anything typed in the form counts, whatever the control.
  useEffect(() => {
    const body = bodyRef.current;

    const onInput = () => {
      touched.current = true;
    };

    body?.addEventListener('input', onInput);

    return () => body?.removeEventListener('input', onInput);
  }, [bodyRef]);

  return useHotkeys<HTMLDivElement>(
    'esc',
    () => {
      if (!touched.current) {
        onCancel();

        return;
      }

      void confirm({
        message: t('discard-title', 'Discard this draft?'),
        options: {
          description: t('discard-description', 'What you typed here is not saved.'),
          okLabel: t('discard', 'Discard'),
          cancelLabel: t('keep-editing', 'Keep editing'),
          variants: { ok: 'destructive' },
        },
      }).then(onCancel);
    },
    {
      enableOnFormTags: true,
      enableOnContentEditable: true,
      preventDefault: true,
      ignoreEventWhen: (event) =>
        Boolean(saving) || event.defaultPrevented || isOverlayShown(bodyRef.current),
    },
  );
};

/**
 * A new record's form in the side panel: its rows, then Cancel and Save.
 * Nothing is saved until Save. The first field takes focus when it opens; Enter in a field
 * saves, and Escape cancels (asking first once something was typed).
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
  const bodyRef = useRef<HTMLDivElement>(null);
  const rootRef = useEscapeToCancel(bodyRef, onCancel, saving);

  useFocusFirstField(bodyRef);

  return (
    <div
      ref={rootRef}
      className="flex flex-1 min-h-0 flex-col"
      aria-busy={saving ? true : undefined}
    >
      <div ref={bodyRef} className="flex-1 min-h-0 overflow-y-auto">
        <div className="flex flex-col gap-1 p-3">{children}</div>
      </div>
      <div data-save-bar className="flex shrink-0 justify-end gap-1 border-t bg-background p-2">
        <Button type="button" variant="ghost" size="sm" disabled={saving} onClick={onCancel}>
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
