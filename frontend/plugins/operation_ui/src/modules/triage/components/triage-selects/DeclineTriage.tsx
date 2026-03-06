import { STATUS_TYPES } from '@/operation/components/StatusInline';
import { useConvertTriage } from '@/triage/hooks/useConvertTriage';
import { Button, Dialog, Textarea } from 'erxes-ui';
import { useState } from 'react';

export const DeclineTriage = ({ triageId }: { triageId: string }) => {
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);
  const { convertTriageToTask, loading } = useConvertTriage();
  const declineTriage = () => {
    convertTriageToTask({
      variables: {
        id: triageId,
        status: STATUS_TYPES.CANCELLED,
        reason,
      },
      onCompleted: () => {
        setOpen(false);
        setReason('');
      },
    });
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline">Decline Triage</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Decline Triage</Dialog.Title>
          <Dialog.Description className="pt-1">
            Please provide a reason for declining this triage.
          </Dialog.Description>
        </Dialog.Header>
        <div className="py-3">
          <Textarea
            placeholder="Reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Dialog.Close>
          <Button onClick={declineTriage} disabled={!reason || loading}>
            Decline
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
