import { Button } from 'erxes-ui';

// Docked above the composer when the agent is waiting on a destructive op. Shows
// the model's confirmation question with Deny / Approve. Approve replays the
// gated op; Deny tells the agent to cancel. Both continue the turn without a
// visible user message.
export const ApprovalBar = ({
  prompt,
  busy,
  onApprove,
  onDeny,
}: {
  prompt: string;
  busy?: boolean;
  onApprove: () => void;
  onDeny: () => void;
}) => (
  <div className="ea-pop mx-auto mb-2 w-full max-w-3xl rounded-lg border bg-muted/40 px-4 py-3">
    <p className="text-sm leading-relaxed text-foreground">{prompt}</p>
    <div className="mt-2.5 flex items-center justify-end gap-2">
      <Button variant="outline" onClick={onDeny} disabled={busy}>
        Deny
      </Button>
      <Button variant="destructive" onClick={onApprove} disabled={busy}>
        Approve
      </Button>
    </div>
  </div>
);
