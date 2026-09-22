import { useResumeSending } from '@/settings/email-ramp/hooks/useEmailRamp';
import { IconPlayerPlay } from '@tabler/icons-react';
import { Button, Dialog, Input, Label } from 'erxes-ui';
import { useState } from 'react';

export const ResumeSendingDialog = ({
  reason,
  open,
  onOpenChange,
}: {
  reason?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const [note, setNote] = useState('');
  const { resume, loading } = useResumeSending();

  const close = (next: boolean) => {
    if (!next) {
      setNote('');
    }

    onOpenChange(next);
  };

  const onSubmit = async () => {
    if (await resume(note.trim())) {
      close(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>Resume sending</Dialog.Title>
          <Dialog.Description>
            {reason ?? 'Sending was stopped because too much mail was failing.'}{' '}
            Measuring starts over from now, so the rate that stopped it will not
            stop it again — if the cause is still there, it will trip a second
            time.
          </Dialog.Description>
        </Dialog.Header>

        <div className="flex flex-col gap-2">
          <Label htmlFor="resume-note">What was fixed?</Label>
          <Input
            id="resume-note"
            value={note}
            placeholder="Removed the imported list that was bouncing"
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        <Dialog.Footer>
          <Button variant="secondary" onClick={() => close(false)}>
            Cancel
          </Button>
          <Button disabled={!note.trim() || loading} onClick={onSubmit}>
            <IconPlayerPlay className="size-4" />
            Resume sending
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
