import {
  IconArrowsDiagonal,
  IconHistory,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { Button, cn, Popover, Sheet, useIsMobile } from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
  AGENT_SIDE_PANEL_MAX_WIDTH,
  AGENT_SIDE_PANEL_MIN_WIDTH,
  agentSidePanelOpenState,
  agentSidePanelThreadRequestState,
  agentSidePanelWidthState,
} from '../states/agentPanelStates';
import { getPageRecordFromLocation } from '../references/getPageRecordFromLocation';
import { useAgentActivity } from '../hooks/useAgentActivity';
import { useAgentsChat } from '../hooks/useAgentsChat';
import { useAgentsThreads } from '../hooks/useAgentsThreads';
import { AgentPanelResizeHandle } from './AgentPanelResizeHandle';
import { AgentPageContextChip } from './AgentPageContextChip';
import { AgentThreadActionsMenu } from './AgentThreadActionsMenu';
import { ChatPanel } from './ChatPanel';
import { ThreadList } from './ThreadList';

/**
 * The panel itself mounts only while open, so the chat hook (and its
 * thread restore) does not run on every page load. This also guarantees
 * the page and the panel never hold a chat on the same thread at once —
 * the wrapper returns null on `/agent*` before the inner component mounts.
 */
const AgentSidePanelInner = ({ isMobile }: { isMobile: boolean }) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const [open, setOpen] = useAtom(agentSidePanelOpenState);
  const [width, setWidth] = useAtom(agentSidePanelWidthState);
  const threadRequest = useAtomValue(agentSidePanelThreadRequestState);
  const setThreadRequest = useSetAtom(agentSidePanelThreadRequestState);
  const location = useLocation();
  const navigate = useNavigate();
  const chat = useAgentsChat({ sessionScope: 'panel' });
  const threadsState = useAgentsThreads();
  useAgentActivity(chat, open);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [contextDismissed, setContextDismissed] = useState(false);

  const pageRecord = getPageRecordFromLocation(
    location.pathname,
    location.search,
  );

  // The chip re-appears on a different record page; dismissing only hides
  // it for the current record.
  const dismissedForRef = useRef<string | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const recordKey = pageRecord ? `${pageRecord.type}:${pageRecord.id}` : null;

    if (recordKey && dismissedForRef.current !== recordKey) {
      dismissedForRef.current = recordKey;
      setContextDismissed(false);
    }
  }, [pageRecord]);

  const visibleRecord =
    pageRecord && !contextDismissed ? pageRecord : undefined;

  const setPageContext = chat.setPageContext;

  useEffect(() => {
    setPageContext({
      path: location.pathname,
      record: visibleRecord,
    });
  }, [setPageContext, location.pathname, visibleRecord]);

  useEffect(() => {
    if (threadRequest) {
      void chat.openThread(threadRequest);
      setThreadRequest(null);
    }
  }, [threadRequest, chat, setThreadRequest]);

  const handleNewConversation = useCallback(() => {
    void chat.startNewConversation();
    setHistoryOpen(false);
  }, [chat]);

  const handleSelectThread = useCallback(
    (selectedThreadId: string) => {
      setHistoryOpen(false);
      void chat.openThread(selectedThreadId);
    },
    [chat],
  );

  const openInFullPage = useCallback(() => {
    navigate(chat.threadId ? `/agent/${chat.threadId}` : '/agent');
    setOpen(false);
  }, [chat.threadId, navigate, setOpen]);

  const activeThread = chat.threadId
    ? [...threadsState.pinnedThreads, ...threadsState.threads].find(
        (thread) => thread.id === chat.threadId,
      )
    : undefined;
  const threadTitle = activeThread?.title;

  const header = (
    <div className="flex h-12 shrink-0 items-center gap-1 border-b px-2">
      <div className="min-w-0 flex-1 px-2">
        <p className="truncate text-sm font-medium">
          {threadTitle || t('new-chat', 'New chat')}
        </p>
      </div>
      {chat.threadId && (
        <AgentThreadActionsMenu
          threadId={chat.threadId}
          title={activeThread?.title ?? ''}
          pinned={activeThread?.pinned === true}
          messages={chat.messages}
          onDeleted={() => void chat.startNewConversation()}
        />
      )}
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={handleNewConversation}
        aria-label={t('new-chat', 'New chat')}
      >
        <IconPlus className="size-4" />
      </Button>
      <Popover open={historyOpen} onOpenChange={setHistoryOpen}>
        <Popover.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            aria-label={t('history', 'History')}
          >
            <IconHistory className="size-4" />
          </Button>
        </Popover.Trigger>
        <Popover.Content className="w-80 p-0" align="end">
          <div className="h-[420px]">
            <ThreadList
              threadsState={threadsState}
              activeThreadId={chat.threadId}
              onSelectThread={handleSelectThread}
              onNewConversation={handleNewConversation}
              onThreadDeleted={(deletedThreadId) => {
                if (chat.threadId === deletedThreadId) {
                  void chat.startNewConversation();
                }
              }}
            />
          </div>
        </Popover.Content>
      </Popover>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={openInFullPage}
        aria-label={t('open-full-page', 'Open in full page')}
      >
        <IconArrowsDiagonal className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={() => setOpen(false)}
        aria-label={t('close', 'Close')}
      >
        <IconX className="size-4" />
      </Button>
    </div>
  );

  const contextRow = visibleRecord ? (
    <AgentPageContextChip
      record={visibleRecord}
      onDismiss={() => setContextDismissed(true)}
    />
  ) : null;

  const body = (
    <div className="flex h-full min-h-0 flex-col">
      {header}
      <ChatPanel
          chat={chat}
          width="full"
          variant="panel"
          contextRow={contextRow}
        />
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <Sheet.View
          side="right"
          className="flex w-screen max-w-full flex-col p-0"
        >
          <Sheet.Title className="sr-only">
            {t('panel-label', 'AI chat panel')}
          </Sheet.Title>
          {body}
        </Sheet.View>
      </Sheet>
    );
  }

  return (
    <aside
      ref={panelRef}
      className={cn(
        'absolute inset-y-0 right-0 z-50 flex min-h-0 max-w-full border-l bg-background shadow-xl',
        !open && 'hidden',
      )}
      style={{ width }}
      aria-label={t('panel-label', 'AI chat panel')}
      aria-hidden={!open}
    >
      <div className="relative flex min-w-0 flex-1 flex-col">
        <AgentPanelResizeHandle
          label={t('resize', 'Resize panel')}
          panelRef={panelRef}
          min={AGENT_SIDE_PANEL_MIN_WIDTH}
          max={AGENT_SIDE_PANEL_MAX_WIDTH}
          onResize={setWidth}
          onReset={() => setWidth(420)}
        />
        {body}
      </div>
    </aside>
  );
};

/**
 * Global AI chat side panel overlaid on the right edge of
 * `NavigationWorkspace` (absolute, z-50) so the page keeps its full width
 * while chatting. After the first open it stays mounted —
 * hidden while closed — so the chat stream keeps feeding the tray's
 * activity atom. Not rendered on `/agent*` — the full page and the panel
 * would mount a second chat on the same thread.
 */
export const AgentSidePanel = () => {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();

  if (pathname.startsWith('/agent')) {
    return null;
  }

  return <AgentSidePanelInner isMobile={isMobile} />;
};
