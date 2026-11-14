import { Button, Sheet, Spinner } from 'erxes-ui';
import type { SubmitEvent, ReactNode } from 'react';

/** Side sheet with a form: title, scrolling body, sticky footer. */
export const FormSheet = ({
  open,
  onOpenChange,
  title,
  description,
  onSubmit,
  submitLabel = 'Save',
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
}) => (
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
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Spinner size="sm" />}
            {submitLabel}
          </Button>
        </Sheet.Footer>
      </form>
    </Sheet.View>
  </Sheet>
);
