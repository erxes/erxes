import {
  useState,
  type MouseEvent as ReactMouseEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import {
  IconChevronLeft,
  IconLoader2,
  IconMessage2,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { Button, Skeleton } from 'erxes-ui';
import { IMastraThread } from '~/modules/chat/types';
import { useThreadWorking } from '~/modules/chat/hooks/useChatView';

type DeleteHandler = (
  e: ReactMouseEvent | ReactKeyboardEvent,
  threadId: string,
) => void;

type RenameHandler = (id: string, threadId: string, title: string) => void;

interface SessionItemProps {
  session: IMastraThread;
  agentId: string;
  active: boolean;
  onSelect: (threadId: string) => void;
  onDelete: DeleteHandler;
  onRename: RenameHandler;
}

const SessionItem = ({
  session,
  agentId,
  active,
  onSelect,
  onDelete,
  onRename,
}: SessionItemProps) => {
  const working = useThreadWorking(agentId, session.threadId);
  const title = session.title || 'New chat';
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  const beginEdit = () => {
    setDraftTitle(title);
    setEditing(true);
  };

  const commit = () => {
    setEditing(false);
    const next = draftTitle.trim();
    if (next && next !== title) {
      onRename(session._id, session.threadId, next);
    }
  };

  return (
    <button
      onClick={() => onSelect(session.threadId)}
      className={`group/sess w-full text-left rounded-md px-2.5 py-2 transition-all hover:bg-accent border-l-2 ${
        active
          ? 'bg-accent border-primary'
          : 'border-transparent hover:border-border'
      } ${working ? 'ea-working' : ''}`}
    >
      <div className="flex items-center gap-1.5">
        {working ? (
          <IconLoader2 className="size-3.5 text-primary shrink-0 animate-spin" />
        ) : (
          <IconMessage2 className="size-3.5 text-muted-foreground shrink-0" />
        )}
        {editing ? (
          <input
            autoFocus
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={commit}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') {
                e.preventDefault();
                commit();
              }
              if (e.key === 'Escape') {
                e.preventDefault();
                setEditing(false);
              }
            }}
            className="text-sm flex-1 min-w-0 bg-transparent outline-none border-b border-primary"
          />
        ) : (
          <p
            className="text-sm truncate flex-1"
            onDoubleClick={(e) => {
              e.stopPropagation();
              beginEdit();
            }}
          >
            {title}
          </p>
        )}
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => onDelete(e, session.threadId)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onDelete(e, session.threadId);
            }
          }}
          className="opacity-0 group-hover/sess:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
        >
          <IconTrash className="size-3.5" />
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground pl-5">
        {session.messageCount} message{session.messageCount === 1 ? '' : 's'}
      </p>
    </button>
  );
};

interface SessionListProps {
  agentId: string;
  sessions: IMastraThread[];
  sessionsLoaded: boolean;
  isDraft: boolean;
  activeThreadId?: string;
  onSelect: (threadId: string) => void;
  onNew: () => void;
  onDelete: DeleteHandler;
  onRename: RenameHandler;
  onBack?: () => void;
}

export const SessionList = ({
  agentId,
  sessions,
  sessionsLoaded,
  isDraft,
  activeThreadId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  onBack,
}: SessionListProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="px-2 py-2 border-b flex items-center justify-between">
        <div className="flex items-center gap-1">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="size-6"
              onClick={onBack}
              title="Back to agents"
            >
              <IconChevronLeft className="size-3.5" />
            </Button>
          )}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Sessions
          </p>
        </div>
        <Button variant="ghost" size="icon" className="size-6" onClick={onNew}>
          <IconPlus className="size-3.5" />
        </Button>
      </div>
      <div className="flex-1 overflow-auto p-1.5 space-y-0.5">
        {!sessionsLoaded ? (
          <div className="space-y-1.5 p-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : (
          <>
            {isDraft && (
              <div
                className={`rounded-md px-2.5 py-2 ${
                  activeThreadId &&
                  !sessions.some((s) => s.threadId === activeThreadId)
                    ? 'bg-accent'
                    : ''
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <IconMessage2 className="size-3.5 text-muted-foreground shrink-0" />
                  <p className="text-sm truncate flex-1">New chat</p>
                </div>
                <p className="text-[11px] text-muted-foreground pl-5">
                  Unsaved · send a message
                </p>
              </div>
            )}
            {sessions.length === 0 && !isDraft ? (
              <p className="text-xs text-muted-foreground px-2.5 py-3">
                No sessions yet.
              </p>
            ) : (
              sessions.map((s) => (
                <SessionItem
                  key={s.threadId}
                  session={s}
                  agentId={agentId}
                  active={s.threadId === activeThreadId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onRename={onRename}
                />
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
};
