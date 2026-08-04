import { IconCheck, IconCopy, IconKey } from '@tabler/icons-react';
import { Button, Dialog, Input, useToast } from 'erxes-ui';
import { useState } from 'react';

export const OAuthClientSecretDialog = ({
  open,
  onOpenChange,
  clientName,
  secret,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  secret?: string;
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!secret) return;

    await navigator.clipboard.writeText(secret);
    setCopied(true);
    toast({
      variant: 'success',
      title: 'Client secret copied to clipboard',
    });

    window.setTimeout(() => setCopied(false), 2000);
  };

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
          <Input readOnly value={secret || ''} className="font-mono text-xs" />
          <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
            Keep this secret in a secure server-side store before you continue.
          </div>
        </div>

        <Dialog.Footer>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleCopy} disabled={!secret}>
            {copied ? <IconCheck /> : <IconCopy />}
            {copied ? 'Copied' : 'Copy secret'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
