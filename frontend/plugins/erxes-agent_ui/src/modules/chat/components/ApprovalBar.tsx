import { IconAlertTriangle } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

// Docked above the composer when the agent is waiting on a destructive op. Shows
// the model's confirmation question and prominent Deny / Approve actions. Approve
// replays the gated op; Deny tells the agent to cancel. Both continue the turn
// without adding a visible user message.
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
  <div className="ea-pop mx-auto mb-2 w-full max-w-3xl rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4 shadow-sm">
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-500">
        <IconAlertTriangle className="size-4" />
      </span>
      <p className="flex-1 text-sm font-medium leading-relaxed">{prompt}</p>
    </div>
    <div className="mt-3 flex gap-2">
      <Button
        variant="outline"
        className="h-10 flex-1 text-sm font-semibold"
        onClick={onDeny}
        disabled={busy}
      >
        Deny
      </Button>
      <Button
        variant="destructive"
        className="h-10 flex-1 text-sm font-semibold"
        onClick={onApprove}
        disabled={busy}
      >
        Approve
      </Button>
    </div>
  </div>
);
