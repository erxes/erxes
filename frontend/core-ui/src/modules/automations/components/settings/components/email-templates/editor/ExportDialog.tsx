import { useState } from 'react';
import { Button, Dialog, Tabs, Textarea } from 'erxes-ui';
import { IconCheck, IconCopy } from '@tabler/icons-react';

interface ExportState {
  html: string;
  text: string;
  json: string;
}

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exportState: ExportState;
}

const TABS = ['html', 'text', 'json'] as const;
type ExportKind = (typeof TABS)[number];

const TAB_LABELS: Record<ExportKind, string> = {
  html: 'HTML',
  text: 'Plain text',
  json: 'JSON',
};

export const ExportDialog = ({
  open,
  onOpenChange,
  exportState,
}: ExportDialogProps) => {
  const [lastCopied, setLastCopied] = useState<ExportKind | null>(null);

  const copy = async (kind: ExportKind, value: string) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setLastCopied(kind);
    window.setTimeout(() => setLastCopied(null), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-4xl p-0">
        <div className="border-b px-6 py-4">
          <Dialog.Title className="text-base font-semibold">
            Export template
          </Dialog.Title>
          <Dialog.Description className="mt-0.5 text-sm text-muted-foreground">
            HTML, plain text, and JSON representations of the current editor
            content.
          </Dialog.Description>
        </div>

        <Tabs defaultValue="html" className="flex min-h-[60vh] flex-col">
          <Tabs.List className="px-6 pt-3">
            {TABS.map((kind) => (
              <Tabs.Trigger key={kind} value={kind}>
                {TAB_LABELS[kind]}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {TABS.map((kind) => (
            <Tabs.Content
              key={kind}
              value={kind}
              className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-4"
            >
              <div className="mb-3 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void copy(kind, exportState[kind])}
                >
                  {lastCopied === kind ? (
                    <IconCheck className="size-3.5" />
                  ) : (
                    <IconCopy className="size-3.5" />
                  )}
                  {lastCopied === kind ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <Textarea
                readOnly
                value={exportState[kind]}
                className="min-h-0 flex-1 resize-none bg-muted/30 font-mono text-xs leading-5"
              />
            </Tabs.Content>
          ))}
        </Tabs>
      </Dialog.Content>
    </Dialog>
  );
};
