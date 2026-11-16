import { IconCheck, IconCopy } from '@tabler/icons-react';
import { Button, Dialog, Input, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf } from '@erxes/core-contract/client';

/** A secret or key the API returns once: shown in a dialog to copy now. */
export const ShownOnce = ({
  value,
  title,
  description,
  onClose,
}: {
  value: string;
  title: string;
  description: string;
  onClose: () => void;
}) => {
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content>
        <Dialog.HeaderCombined title={title} description={description} />
        <div className="flex gap-2">
          <Input readOnly value={value} aria-label={title} text="code" />
          <Button variant="outline" aria-label={t('copy', 'Copy')} onClick={() => void copy()}>
            {copied ? <IconCheck /> : <IconCopy />}
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
