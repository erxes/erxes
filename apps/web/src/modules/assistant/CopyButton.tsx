import { IconCopy } from '@tabler/icons-react';
import { Button, IconTip, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const CopyButton = ({ text }: { text: string }) => {
  const { t } = useTranslation('assistant');
  const { toast } = useToast();

  const copy = () =>
    void navigator.clipboard
      .writeText(text)
      .then(() => toast({ title: t('copied', 'Copied') }))
      .catch(() => toast({ variant: 'destructive', title: t('copy-failed', 'Could not copy') }));

  return (
    <IconTip label={t('copy', 'Copy')}>
      <Button
        variant="ghost"
        size="icon"
        tone="muted"
        aria-label={t('copy', 'Copy')}
        onClick={copy}
      >
        <IconCopy className="size-3.5" />
      </Button>
    </IconTip>
  );
};
