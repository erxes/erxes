import { IconSend } from '@tabler/icons-react';
import { Button, Input, Popover, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useBroadcastSendTestEmail } from '../hooks/useBroadcastSendTestEmail';

export const BroadcastSendTestEmail = () => {
  const { getValues } = useFormContext();
  const { toast } = useToast();
  const { sendTestEmail, loading } = useBroadcastSendTestEmail();

  const [to, setTo] = useState('');
  const [open, setOpen] = useState(false);

  const handleSend = () => {
    const { fromEmail, email } = getValues();

    sendTestEmail({
      variables: {
        from: fromEmail,
        to,
        contentJson: email?.contentJson,
        title: email?.subject || '',
      },
      onCompleted: () => {
        toast({ variant: 'default', title: `Test email sent to ${to}` });
        setOpen(false);
      },
      onError: (error) => {
        toast({ variant: 'destructive', title: error.message });
      },
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button variant="secondary" type="button">
          <IconSend />
          Send test
        </Button>
      </Popover.Trigger>
      <Popover.Content className="flex flex-col gap-2 w-80">
        <Input
          type="email"
          placeholder="you@example.com"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <Button
          type="button"
          disabled={!to || loading}
          onClick={handleSend}
          className="w-full"
        >
          {loading ? 'Sending...' : 'Send test email'}
        </Button>
      </Popover.Content>
    </Popover>
  );
};
