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
      toast({ variant: 'destructive', title: 'Failed to copy to clipboard' });
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
          aria-label={`Copy ${label}`}
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-xl">
        <Dialog.Header>
          <Dialog.Title className="flex items-center gap-2">
            <IconKey size={18} />
            Client secret created
          </Dialog.Title>
          <Dialog.Description>
            Save this secret for {clientName}. It will not be shown again after
            closing this dialog.
          </Dialog.Description>
        </Dialog.Header>

        <div className="space-y-3">
          <CopyableField
            id="oauth-client-id"
            label="Client ID"
            value={clientId}
            copiedMessage="Client ID copied to clipboard"
          />
          <CopyableField
            id="oauth-client-secret"
            label="Client secret"
            value={secret}
            copiedMessage="Client secret copied to clipboard"
          />
          <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
            Keep this secret in a secure server-side store before you continue.
          </div>
        </div>

        <Dialog.Footer>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
