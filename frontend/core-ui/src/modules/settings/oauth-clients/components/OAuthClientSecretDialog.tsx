import { useTranslation } from 'react-i18next';
import { IconCheck, IconCopy, IconKey } from '@tabler/icons-react';
import { Button, Dialog, Input, Label, useToast } from 'erxes-ui';
import { useState } from 'react';

const CopyableField = ({
  id,
  label,
  value,
  copiedMessage,
}: {
  id: string;
  label: string;
  value?: string;
  copiedMessage: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'oauth-clients' });
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({ variant: 'success', title: copiedMessage });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ variant: 'destructive', title: t('copy-to-clipboard-failed') });
    }
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={id}
          readOnly
          value={value || ''}
          className="font-mono text-xs"
        />
        <Button
          variant="secondary"
          size="icon"
          onClick={handleCopy}
          disabled={!value}
          aria-label={t('copy-label', { label })}
        >
          {copied ? <IconCheck /> : <IconCopy />}
        </Button>
      </div>
    </div>
  );
};

export const OAuthClientSecretDialog = ({
  open,
  onOpenChange,
  clientName,
  clientId,
  secret,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  clientId?: string;
  secret?: string;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'oauth-clients' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-xl">
        <Dialog.Header>
          <Dialog.Title className="flex items-center gap-2">
            <IconKey size={18} />
            {t('secret-created')}
          </Dialog.Title>
          <Dialog.Description>
            {t('secret-save-notice', { clientName })}
          </Dialog.Description>
        </Dialog.Header>

        <div className="space-y-3">
          <CopyableField
            id="oauth-client-id"
            label={t('client-id')}
            value={clientId}
            copiedMessage={t('client-id-copied')}
          />
          <CopyableField
            id="oauth-client-secret"
            label={t('client-secret')}
            value={secret}
            copiedMessage={t('secret-copied')}
          />
          <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
            {t('secret-keep-safe')}
          </div>
        </div>

        <Dialog.Footer>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {t('close')}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
