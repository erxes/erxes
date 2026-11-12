import { IconArrowMerge } from '@tabler/icons-react';
import { Button, cn, Dialog, Spinner } from 'erxes-ui';
import { useState } from 'react';

export interface MergeCandidate {
  id: string;
  title: string;
  details: string[];
}

/**
 * Pick which record to keep; the others are merged into it. Empty fields are
 * filled from the others; contacts, tags and links are combined.
 */
export const MergeDialog = ({
  open,
  onOpenChange,
  noun,
  records,
  merging,
  onMerge,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noun: string;
  records: MergeCandidate[];
  merging?: boolean;
  onMerge: (keepId: string) => void;
}) => {
  const [keepId, setKeepId] = useState(records[0]?.id ?? '');
  const [wasOpen, setWasOpen] = useState(open);

  // Each opening starts with the first record kept.
  if (open !== wasOpen) {
    setWasOpen(open);

    if (open) setKeepId(records[0]?.id ?? '');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-lg">
        <Dialog.Header>
          <Dialog.Title>
            Merge {records.length} {noun}
          </Dialog.Title>
          <Dialog.Description>
            Choose the {noun.replace(/s$/, '')} to keep. Its empty fields are filled from the
            others; emails, phones, tags and links are combined. The others are deleted, and their
            links open the kept one.
          </Dialog.Description>
        </Dialog.Header>
        <div role="radiogroup" className="flex flex-col gap-2">
          {records.map((record) => (
            <button
              key={record.id}
              type="button"
              role="radio"
              aria-checked={record.id === keepId}
              onClick={() => setKeepId(record.id)}
              className={cn(
                'flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring',
                record.id === keepId && 'border-primary bg-primary/5 hover:bg-primary/10',
              )}
            >
              <span className="flex w-full items-center justify-between gap-2 text-sm font-medium">
                <span className="truncate">{record.title}</span>
                {record.id === keepId && <span className="text-xs text-primary">Keep</span>}
              </span>
              {record.details.filter(Boolean).map((detail) => (
                <span key={detail} className="truncate text-xs text-muted-foreground">
                  {detail}
                </span>
              ))}
            </button>
          ))}
        </div>
        <Dialog.Footer>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={merging}>
            Cancel
          </Button>
          <Button onClick={() => onMerge(keepId)} disabled={!keepId || merging}>
            {merging ? <Spinner size="sm" /> : <IconArrowMerge />}
            Merge
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
