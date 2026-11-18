import { useCallback, useId, useRef, useState, type SubmitEvent, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { Trans, useTranslation } from 'react-i18next';
import { AlertDialog } from 'erxes-ui/components/alert-dialog';
import type { ButtonProps } from 'erxes-ui/components/button';
import { Input } from 'erxes-ui/components/input';
import { Label } from 'erxes-ui/components/label';

type OptionProps = {
  okLabel?: string;
  cancelLabel?: string;
  description?: string;
  /** Text the member must type before confirming. */
  confirmationValue?: string;
  content?: ReactNode;
  variants?: {
    ok?: ButtonProps['variant'];
    cancel?: ButtonProps['variant'];
  };
};

type ConfirmDialogProps = {
  message: string;
  options?: OptionProps;
  onConfirm: () => void;
  onDismiss: () => void;
};

/** The typed confirmation, when the options ask for one. */
const ConfirmationField = ({
  value,
  expected,
  error,
  inputRef,
  onChange,
}: {
  value: string;
  expected: string;
  error: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (value: string) => void;
}) => {
  const id = useId();
  const { t } = useTranslation('ui', { keyPrefix: 'confirm' });

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="select-none" variant="peer">
        <span className="text-xs">
          <Trans
            t={t}
            i18nKey="type-to-confirm"
            defaults="Type <b>{{expected}}</b> in the field below to confirm."
            values={{ expected }}
            components={{ b: <span className="font-semibold" /> }}
          />
        </span>
      </Label>
      <Input
        id={id}
        ref={inputRef}
        type="text"
        placeholder={t('placeholder', 'Enter confirmation')}
        value={value}
        aria-invalid={error}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && (
        <p id={`${id}-error`} className="text-sm font-medium text-destructive-text">
          {t('mismatch', 'Enter {{expected}} to confirm', { expected })}
        </p>
      )}
    </div>
  );
};

const ConfirmDialog = ({ message, options = {}, onConfirm, onDismiss }: ConfirmDialogProps) => {
  const { t } = useTranslation('ui', { keyPrefix: 'confirm' });

  const {
    okLabel = t('ok', 'Confirm'),
    cancelLabel = t('cancel', 'Cancel'),
    description,
    confirmationValue,
    content,
    variants = {},
  } = options;

  const [typed, setTyped] = useState('');
  const [mismatch, setMismatch] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const proceed = (event: SubmitEvent) => {
    event.preventDefault();

    if (confirmationValue && typed !== confirmationValue) {
      setMismatch(true);
      inputRef.current?.focus();

      return;
    }

    onConfirm();
  };

  return (
    <AlertDialog open>
      <AlertDialog.Content initialFocus={confirmationValue ? inputRef : undefined}>
        <AlertDialog.Header>
          <AlertDialog.Title>{message}</AlertDialog.Title>
          {description && <AlertDialog.Description> {description} </AlertDialog.Description>}
        </AlertDialog.Header>
        {content}
        <form onSubmit={proceed}>
          {confirmationValue && (
            <ConfirmationField
              value={typed}
              expected={confirmationValue}
              error={mismatch}
              inputRef={inputRef}
              onChange={setTyped}
            />
          )}
          <br />
          <AlertDialog.Footer>
            <AlertDialog.Cancel onClick={onDismiss} type="button" variant={variants.cancel}>
              {cancelLabel}
            </AlertDialog.Cancel>
            <AlertDialog.Action type="submit" variant={variants.ok}>
              {okLabel}
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </form>
      </AlertDialog.Content>
    </AlertDialog>
  );
};

/**
 * `confirm` shows a confirmation dialog in its own root. The promise resolves when the member
 * confirms and stays pending when they cancel, so callers chain the action with `.then`.
 */
export const useConfirm = () => {
  const confirm = useCallback(
    ({ message, options }: { message: string; options?: OptionProps }) =>
      new Promise<void>((resolve) => {
        const wrapper = document.createElement('div');
        const root = createRoot(wrapper);
        let isOpen = true;

        document.body.append(wrapper);

        const close = () => {
          if (!isOpen) return;

          isOpen = false;
          root.unmount();
          wrapper.remove();
        };

        root.render(
          <ConfirmDialog
            message={message}
            options={options}
            onConfirm={() => {
              resolve();
              close();
            }}
            onDismiss={close}
          />,
        );
      }),
    [],
  );

  return { confirm };
};
