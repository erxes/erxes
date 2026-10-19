import {
  IconArrowUp,
  IconCheck,
  IconCopy,
  IconPencil,
} from '@tabler/icons-react';
import type { UIMessage } from 'ai';
import { Button, Textarea } from 'erxes-ui';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { extractPageContext } from '../utils/pageContext';
import { getMessageText } from '../utils/messages';

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
  const text = getMessageText({ ...message, parts });
  const [draft, setDraft] = useState(text);
  const [copied, setCopied] = useState(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const wasEditingRef = useRef(editing);
  const trimmed = draft.trim();

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
            <Textarea
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
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
              aria-label="Edit message"
              rows={4}
              className="max-h-72 min-h-24 resize-y rounded-lg p-0 text-sm leading-6 shadow-none focus-visible:shadow-none"
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
          {children}
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
                ?.writeText(text)
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
        {text && !editing && (
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
              setDraft(text);
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
