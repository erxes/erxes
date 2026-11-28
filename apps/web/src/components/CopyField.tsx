import { IconCheck, IconCopy } from '@tabler/icons-react';
import { Button, Input, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf } from '@erxes/core-contract/client';

/** A value to copy, such as a key or a command: read-only, with a copy button. */
export const CopyField = ({ value, label }: { value: string; label: string }) => {
  // Two-factor setup shows its key the same way and already has these words.
  const { t } = useTranslation('common', { keyPrefix: 'two-factor' });
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copy = () =>
    navigator.clipboard.writeText(value).then(
      () => setCopied(true),
      (error: unknown) =>
        toast({
          variant: 'destructive',
          title: t('copy-failed', 'Could not copy'),
          description: messageOf(error),
        }),
    );

  return (
    <div className="flex gap-2">
      <Input readOnly value={value} aria-label={label} text="code" />
      <Button variant="outline" aria-label={t('copy', 'Copy')} onClick={() => void copy()}>
        {copied ? <IconCheck /> : <IconCopy />}
      </Button>
    </div>
  );
};
