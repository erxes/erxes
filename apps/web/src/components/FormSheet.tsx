import { Button, Sheet, Spinner } from 'erxes-ui';
import type { SubmitEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Side sheet with a form: title, scrolling body, sticky footer. It opens with the cursor in the
 * first field; Enter saves and Escape or Cancel closes it.
 */
export const FormSheet = ({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitLabel,
  submitting,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  submitting?: boolean;
  children: ReactNode;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'form' });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View size="lg">
        <form onSubmit={onSubmit} className="flex h-full min-h-0 flex-col" noValidate>
          <Sheet.Header>
            <Sheet.Title>{title}</Sheet.Title>
            <Sheet.Description className={description ? undefined : 'sr-only'}>
              {description ?? title}
            </Sheet.Description>
            <Sheet.Close />
          </Sheet.Header>
          <Sheet.Content className="min-h-0 overflow-y-auto">
            <div className="flex flex-col gap-4">{children}</div>
          </Sheet.Content>
          <Sheet.Footer className="flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {t('cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Spinner size="sm" />}
              {submitLabel ?? t('save', 'Save')}
            </Button>
          </Sheet.Footer>
        </form>
      </Sheet.View>
    </Sheet>
  );
};
