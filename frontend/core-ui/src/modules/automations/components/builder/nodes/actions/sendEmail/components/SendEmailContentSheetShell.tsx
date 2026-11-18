import { Button, Sheet } from 'erxes-ui';

/**
 * The modal both email content editors (blocks and maily) open into: wide
 * enough for the variable browser beside the editor, over the action panel
 * rather than squeezed next to it.
 */
export const SendEmailContentSheetShell = ({
  open,
  onOpenChange,
  title,
  description,
  onSave,
  saveLabel,
  cancelLabel,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onSave: () => void;
  saveLabel: string;
  cancelLabel: string;
  children: React.ReactNode;
}) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <Sheet.View className="flex w-[calc(100vw-2rem)] max-w-[1200px] flex-col sm:max-w-[1200px] md:w-[calc(100vw-2rem)]">
      <Sheet.Header className="h-auto items-start gap-3 py-3">
        <div className="flex flex-1 flex-col gap-1">
          <Sheet.Title>{title}</Sheet.Title>
          <Sheet.Description>{description}</Sheet.Description>
        </div>
        <Sheet.Close />
      </Sheet.Header>
      <Sheet.Content className="flex min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)] overflow-hidden rounded-none border-b-0 p-0 md:grid">
        {children}
      </Sheet.Content>
      <Sheet.Footer className="shrink-0 border-t">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          {cancelLabel}
        </Button>
        <Button onClick={onSave}>{saveLabel}</Button>
      </Sheet.Footer>
    </Sheet.View>
  </Sheet>
);
