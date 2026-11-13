import {
  IconArrowUp,
  IconCheck,
  IconCopy,
  IconPencil,
} from '@tabler/icons-react';
import type { UIMessage } from 'ai';
import { Button } from 'erxes-ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { readAgentMentions } from '../agentMentions';
import { readAgentsFilesPart, withoutFileOnlyText } from '../agentsFiles';
import { useAgentMentions } from '../hooks/useAgentMentions';
import { AgentMentionScope } from '../references/AgentMentionScope';
import { extractPageContext } from '../utils/pageContext';
import { getMessageText } from '../utils/messages';
import {
  agentMentionPlainText,
  parseAgentMentionText,
} from '../utils/mentionText';
import { AgentMentionInput } from './AgentMentionInput';

export interface IUserMessageProps {
  message: UIMessage;
  editing: boolean;
  disabled: boolean;
  onEditingChange: (messageId: string | null) => void;
  onEdit: (messageId: string, text: string) => void;
  children: ReactNode;
}

/** The editor lives at the original turn, so its continuation point is explicit. */
export const UserMessage = ({
  message,
  editing,
  disabled,
  onEditingChange,
  onEdit,
  children,
}: IUserMessageProps) => {
  const { parts } = extractPageContext(message.parts);
  // Files-only turns hide the placeholder prompt; mention tokens stay wire text.
  const text = getMessageText({
    ...message,
    parts: withoutFileOnlyText(parts),
  });
  const hasFiles = parts.some((part) => readAgentsFilesPart(part).length > 0);
  const [initialDraft] = useState(() => parseAgentMentionText(text));
  const [draft, setDraft] = useState(initialDraft.value);
  const draftMentions = useAgentMentions(draft, initialDraft);
  const [copied, setCopied] = useState(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const wasEditingRef = useRef(editing);
  // Wire text: mentions stay `[[type:id:label]]` tokens for the resend.
  const trimmed = draftMentions.serialize(draft).trim();

  useEffect(() => {
    if (wasEditingRef.current && !editing) {
      editButtonRef.current?.focus({ preventScroll: true });
    }
    wasEditingRef.current = editing;
  }, [editing]);

  const cancel = () => {
    onEditingChange(null);
  };

  const submit = () => {
    if (disabled || !trimmed || trimmed === text.trim()) return;
    onEditingChange(null);
    onEdit(message.id, trimmed);
  };

  return (
    <div className="group/user agent-message-enter flex w-full min-w-0 flex-col items-end gap-1.5">
      <p className="pr-1 text-[11px] font-medium text-muted-foreground">You</p>
      {editing ? (
        <form
          className="w-full overflow-hidden rounded-2xl border border-primary/40 bg-card shadow-sm"
          aria-label="Edit your message"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div className="px-4 pt-4">
            <AgentMentionInput
              autoFocus
              mentions={draftMentions}
              value={draft}
              onChange={setDraft}
              onKeyDown={(event) => {
                if (event.nativeEvent.isComposing) return;
                if (event.key === 'Escape') {
                  event.preventDefault();
                  cancel();
                }
                if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                  event.preventDefault();
                  submit();
                }
              }}
              disabled={disabled}
              ariaLabel="Edit message"
              minHeight={96}
              maxHeight={288}
              className="leading-6"
            />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 px-3 pb-3 pt-2">
            <p className="mr-auto basis-full px-1 pb-2 text-xs leading-5 text-muted-foreground">
              Continue from here. Later replies will be replaced. Workspace
              changes already made will stay.
            </p>
            <Button type="button" variant="ghost" size="sm" onClick={cancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="min-h-8 px-3"
              disabled={disabled || !trimmed || trimmed === text.trim()}
            >
              <IconArrowUp className="size-3.5" />
              Save & resend
            </Button>
          </div>
        </form>
      ) : (
        <div className="max-w-[min(90%,44rem)] rounded-[20px] rounded-br-md bg-primary/[0.07] px-4 py-3 ring-1 ring-primary/10 dark:bg-muted/70 dark:ring-white/5 text-foreground [overflow-wrap:anywhere]">
          <AgentMentionScope mentions={readAgentMentions(message.parts)}>
            {children}
          </AgentMentionScope>
        </div>
      )}
      <div className="flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover/user:opacity-100 sm:group-focus-within/user:opacity-100">
        {text && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            aria-label={copied ? 'Message copied' : 'Copy message'}
            title="Copy message"
            onClick={() => {
              void navigator.clipboard
                ?.writeText(agentMentionPlainText(text))
                .then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                })
                .catch(() => undefined);
            }}
          >
            {copied ? (
              <IconCheck className="size-3.5" />
            ) : (
              <IconCopy className="size-3.5" />
            )}
          </Button>
        )}
        {(text || hasFiles) && !editing && (
          <Button
            ref={editButtonRef}
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground"
            aria-label="Edit message"
            title={
              disabled
                ? 'Finish the current response before editing'
                : 'Edit message'
            }
            disabled={disabled}
            onClick={() => {
              setDraft(draftMentions.load(text));
              onEditingChange(message.id);
            }}
          >
            <IconPencil className="size-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
