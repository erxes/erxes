import { IconDeviceFloppy } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { cn } from '../lib/utils';
import { Button } from './button';
import { Spinner } from './spinner';

/** A card of a settings page or a record's own page: a title, a line about it, then its fields. */
export const FormSection = ({
  title,
  description,
  action,
  variant = 'default',
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** A control beside the title, such as a status badge. */
  action?: ReactNode;
  /** `destructive`: a red card for what can't be undone, such as deleting a team. */
  variant?: 'default' | 'destructive';
  children: ReactNode;
}) => (
  <section
    className={cn(
      'space-y-4 rounded-lg border bg-background p-5',
      variant === 'destructive' && 'border-destructive/40',
    )}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0 space-y-0.5">
        <h2
          className={cn(
            'text-base font-semibold',
            variant === 'destructive' && 'text-destructive-text',
          )}
        >
          {title}
        </h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

/**
 * The bar at the bottom of a page's one form: Discard and Save, kept in view while it scrolls.
 * Both are off until something changed; it says so on the left. Discard goes back to the form's
 * defaults unless `onDiscard` does more.
 */
export const FormSaveBar = ({
  saving,
  saveLabel,
  onDiscard,
}: {
  saving?: boolean;
  saveLabel?: string;
  onDiscard?: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'form' });
  const { reset } = useFormContext();
  const { isDirty } = useFormState();

  return (
    <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t bg-background/95 py-3 backdrop-blur">
      {isDirty && (
        <output className="mr-auto text-xs text-muted-foreground">
          {t('unsaved', 'Unsaved changes')}
        </output>
      )}
      <Button
        type="button"
        variant="ghost"
        disabled={!isDirty || saving}
        onClick={() => (onDiscard ? onDiscard() : reset())}
      >
        {t('discard', 'Discard')}
      </Button>
      <Button type="submit" disabled={!isDirty || saving}>
        {saving ? <Spinner size="sm" /> : <IconDeviceFloppy />}
        {saveLabel ?? t('save', 'Save')}
      </Button>
    </div>
  );
};
