import { Button, Sheet, Spinner, cn } from 'erxes-ui';
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
    <Sheet.View className={cn('flex w-full flex-col p-0 sm:max-w-lg')}>
      <form onSubmit={onSubmit} className="flex h-full min-h-0 flex-col" noValidate>
        <Sheet.Header>
          <Sheet.Title>{title}</Sheet.Title>
          <Sheet.Description className={description ? 'text-sm text-muted-foreground' : 'sr-only'}>
            {description ?? title}
          </Sheet.Description>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="min-h-0 overflow-y-auto px-5 py-4">
          <div className="flex flex-col gap-4">{children}</div>
        </Sheet.Content>
        <Sheet.Footer className="flex items-center justify-end gap-2 bg-background">
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
