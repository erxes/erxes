import { IconCheck, IconX } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useState } from 'react';

import { POSES } from '../bloub/engine/states';
import { BotBadge } from './BotBadge';

import { ChatInput } from './ChatInput';
import { describeToolCall, type IAgentToolStep } from '../utils/agentWorkSteps';

export interface IApprovalPromptProps {
  tool: IAgentToolStep;
  busy: boolean;
  onRespond: (decision: { approved: boolean; reason?: string }) => void;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/** Renders the call's input as a compact key/value list. */
const ApprovalInputList = ({ input }: { input: unknown }) => {
  if (!isRecord(input)) {
    return null;
  }

  const entries = Object.entries(input).filter(([, value]) => {
    return value !== undefined;
  });

  if (entries.length === 0) {
    return null;
  }

  return (
    <dl className="mt-2 max-h-64 space-y-2 overflow-auto rounded-md bg-muted/60 px-2.5 py-2 text-xs">
      {entries.map(([key, value]) => (
        <div key={key} className="min-w-0 space-y-1">
          <dt className="shrink-0 font-medium text-muted-foreground">{key}</dt>
          <dd className="min-w-0">
            <pre className="whitespace-pre-wrap break-words font-mono">
              {typeof value === 'string'
                ? value
                : JSON.stringify(value, null, 2)}
            </pre>
          </dd>
        </div>
      ))}
    </dl>
  );
};

/**
 * Inline confirmation for a destructive tool call. The run is suspended
 * server-side until the user decides; approving or declining records the
 * decision on the tool part, and the framework automatically resumes the
 * run through the transport's approval endpoint.
 */
export const ApprovalPrompt = ({
  tool,
  busy,
  onRespond,
}: IApprovalPromptProps) => {
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const { label, args } = describeToolCall(tool.toolName, tool.input);

  return (
    <div className="my-2 rounded-xl border bg-card text-foreground">
      <div className="flex items-start gap-3 px-4 py-3.5">
        <BotBadge
          size={20}
          state="alert"
          frozenAt={POSES.alert}
          className="size-8 rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Approve action?</p>
          <p className="mt-0.5 break-all text-xs text-muted-foreground">
            The agent wants to run{' '}
            <span className="font-medium text-foreground">{label}</span>.
          </p>
          <ApprovalInputList input={args} />

          {declining ? (
            <div className="mt-2.5 space-y-2">
              <div className="rounded-lg border bg-background px-3 py-2">
                <ChatInput
                  value={reason}
                  onChange={setReason}
                  placeholder="Optional reason (shared with the assistant)"
                  disabled={busy}
                  maxHeight={96}
                  className="text-xs md:text-xs"
                  ariaLabel="Decline reason"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busy}
                  onClick={() =>
                    onRespond({
                      approved: false,
                      reason: reason.trim() || undefined,
                    })
                  }
                >
                  <IconX />
                  Decline
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => setDeclining(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-2.5 flex gap-2">
              <Button
                size="sm"
                disabled={busy}
                onClick={() => onRespond({ approved: true })}
              >
                <IconCheck />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => setDeclining(true)}
              >
                <IconX />
                Decline
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Compact settled state that replaces the approval card once the decision
 * is recorded (approval-responded, or output-denied when the backend
 * reports the decline outcome).
 */
export const ApprovalStatusRow = ({ tool }: { tool: IAgentToolStep }) => {
  const { label } = describeToolCall(tool.toolName, tool.input);
  const approved = tool.approval?.approved === true;

  return (
    <div
      className={cn(
        'my-1.5 flex items-center gap-2 px-1 py-1 text-xs',
        approved ? 'text-muted-foreground' : 'text-destructive',
      )}
    >
      {approved ? (
        <IconCheck className="size-3.5 shrink-0" />
      ) : (
        <IconX className="size-3.5 shrink-0" />
      )}
      <span className="min-w-0 truncate">
        {approved ? 'Approved' : 'Declined'}: {label}
      </span>
      {!approved && tool.approval?.reason && (
        <span className="truncate text-muted-foreground">
          — {tool.approval.reason}
        </span>
      )}
    </div>
  );
};
