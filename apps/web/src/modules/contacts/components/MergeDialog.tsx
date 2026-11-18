import { IconArrowMerge } from '@tabler/icons-react';
import { Button, cn, Dialog, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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
  kind,
  records,
  merging,
  onMerge,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What is merged, which the dialog's words name. */
  kind: 'customer' | 'company';
  records: MergeCandidate[];
  merging?: boolean;
  onMerge: (keepId: string) => void;
}) => {
  const { t } = useTranslation('contact');
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
          <Dialog.Title>{t(`merge.title.${kind}`, { total: records.length })}</Dialog.Title>
          <Dialog.Description>{t(`merge.description.${kind}`)}</Dialog.Description>
        </Dialog.Header>
        <fieldset className="flex min-w-0 flex-col gap-2">
          <legend className="sr-only">{t(`merge.legend.${kind}`)}</legend>
          {records.map((record) => (
            <label
              key={record.id}
              className={cn(
                'flex cursor-pointer flex-col items-start gap-0.5 rounded-lg border px-3 py-2 text-left transition-colors hover:bg-accent has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
                record.id === keepId && 'border-primary bg-primary/5 hover:bg-primary/10',
              )}
            >
              <input
                type="radio"
                name="merge-keep"
                value={record.id}
                checked={record.id === keepId}
                onChange={() => setKeepId(record.id)}
                className="sr-only"
              />
              <span className="flex w-full items-center justify-between gap-2 text-sm font-medium">
                <span className="truncate">{record.title}</span>
                {record.id === keepId && (
                  <span className="text-xs text-primary-text">{t('merge.keep', 'Keep')}</span>
                )}
              </span>
              {record.details.filter(Boolean).map((detail) => (
                <span key={detail} className="truncate text-xs text-muted-foreground">
                  {detail}
                </span>
              ))}
            </label>
          ))}
        </fieldset>
        <Dialog.Footer>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={merging}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={() => onMerge(keepId)} disabled={!keepId || merging}>
            {merging ? <Spinner size="sm" /> : <IconArrowMerge />}
            {t('merge.merge', 'Merge')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
