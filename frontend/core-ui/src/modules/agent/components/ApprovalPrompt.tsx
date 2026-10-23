import { IconCheck, IconX } from '@tabler/icons-react';
import { getToolName, type DynamicToolUIPart, type ToolUIPart } from 'ai';
import { Checkbox } from 'erxes-ui';
import { useState } from 'react';

import {
  Confirmation,
  ConfirmationAccepted,
  ConfirmationAction,
  ConfirmationActions,
  ConfirmationRejected,
  ConfirmationRequest,
} from '../elements/confirmation';

import { POSES } from '../bloub/engine/states';
import { BotBadge } from './BotBadge';

import { ChatInput } from './ChatInput';
import {
  describeToolCall,
  summarizeGraphqlCall,
} from '../utils/agentWorkSteps';

export interface IApprovalDecision {
  approvalId: string;
  approved: boolean;
  reason?: string;
  /** Mutation root fields to stop asking about for the rest of the thread. */
  allowForThread?: string[];
}

export interface IApprovalPromptProps {
  part: ToolUIPart | DynamicToolUIPart;
  busy: boolean;
  onRespond: (decision: Omit<IApprovalDecision, 'approvalId'>) => void;
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
 * Inline confirmation for a gated tool call. The run is suspended
 * server-side until the user decides; the decision is recorded on the tool
 * part and the Chat resumes the run. Once decided, the card collapses into a
 * one-line status.
 */
export const ApprovalPrompt = ({
  part,
  busy,
  onRespond,
}: IApprovalPromptProps) => {
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState('');
  const [allowForThread, setAllowForThread] = useState(false);
  const toolName = getToolName(part);
  const { label, args } = describeToolCall(toolName, part.input);
  const call =
    toolName === 'callGraphql' && isRecord(part.input)
      ? summarizeGraphqlCall(part.input)
      : null;
  const mutationFields =
    call?.operation === 'mutation' && call.fields.length ? call.fields : null;

  return (
    <Confirmation approval={part.approval} state={part.state}>
      <ConfirmationRequest>
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
                  <ConfirmationActions>
                    <ConfirmationAction
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
                    </ConfirmationAction>
                    <ConfirmationAction
                      variant="ghost"
                      disabled={busy}
                      onClick={() => setDeclining(false)}
                    >
                      Cancel
                    </ConfirmationAction>
                  </ConfirmationActions>
                </div>
              ) : (
                <>
                  {mutationFields && (
                    <label className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <Checkbox
                        checked={allowForThread}
                        onCheckedChange={(checked) =>
                          setAllowForThread(checked === true)
                        }
                        disabled={busy}
                      />
                      Don't ask again for {mutationFields.join(', ')} in this
                      chat
                    </label>
                  )}
                  <ConfirmationActions className="mt-2.5">
                    <ConfirmationAction
                      disabled={busy}
                      onClick={() =>
                        onRespond({
                          approved: true,
                          allowForThread:
                            allowForThread && mutationFields
                              ? mutationFields
                              : undefined,
                        })
                      }
                    >
                      <IconCheck />
                      Approve
                    </ConfirmationAction>
                    <ConfirmationAction
                      variant="outline"
                      disabled={busy}
                      onClick={() => setDeclining(true)}
                    >
                      <IconX />
                      Decline
                    </ConfirmationAction>
                  </ConfirmationActions>
                </>
              )}
            </div>
          </div>
        </div>
      </ConfirmationRequest>
      <ConfirmationAccepted>
        <p className="my-1.5 flex items-center gap-2 px-1 py-1 text-xs text-muted-foreground">
          <IconCheck className="size-3.5 shrink-0" />
          <span className="min-w-0 truncate">Approved: {label}</span>
        </p>
      </ConfirmationAccepted>
      <ConfirmationRejected>
        <p className="my-1.5 flex items-center gap-2 px-1 py-1 text-xs text-destructive">
          <IconX className="size-3.5 shrink-0" />
          <span className="min-w-0 truncate">Declined: {label}</span>
          {part.approval?.reason && (
            <span className="truncate text-muted-foreground">
              — {part.approval.reason}
            </span>
          )}
        </p>
      </ConfirmationRejected>
    </Confirmation>
  );
};
