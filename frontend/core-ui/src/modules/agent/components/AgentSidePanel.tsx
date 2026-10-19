import {
  IconSettings,
  IconHistory,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { Button, Popover } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SIDE_PANEL_CHAT_PATH, SIDE_PANEL_QUERY_KEY } from 'ui-modules';
import { useTranslation } from 'react-i18next';

import { agentSidePanelThreadRequestState } from '../states/agentPanelStates';
import { getPageRecordFromLocation } from '../references/getPageRecordFromLocation';
import { useAgentActivity } from '../hooks/useAgentActivity';
import { useAgentsChat } from '../hooks/useAgentsChat';
import { useAgentsThreads } from '../hooks/useAgentsThreads';
import { AgentPageContextChip } from './AgentPageContextChip';
import { AgentThreadActionsMenu } from './AgentThreadActionsMenu';
import { ChatPanel } from './ChatPanel';
import { ThreadList } from './ThreadList';

/** Chat content for the shared, space-taking Assistant side panel. */
export const AgentSidePanel = ({
  onClose,
  active,
}: {
  onClose: () => void;
  active: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const threadRequest = useAtomValue(agentSidePanelThreadRequestState);
  const setThreadRequest = useSetAtom(agentSidePanelThreadRequestState);
  const location = useLocation();
  const chat = useAgentsChat({ sessionScope: 'panel' });
  const threadsState = useAgentsThreads();
  useAgentActivity(chat, active);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [contextDismissed, setContextDismissed] = useState(false);

  useEffect(() => {
    if (!active) setHistoryOpen(false);
  }, [active]);

  const pageRecord = getPageRecordFromLocation(
    location.pathname,
    location.search,
  );

  // The chip re-appears on a different record page; dismissing only hides
  // it for the current record.
  const dismissedForRef = useRef<string | null>(null);

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
    if (threadRequest && active) {
      void chat.openThread(threadRequest);
      setThreadRequest(null);
    }
  }, [threadRequest, active, chat, setThreadRequest]);

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

  const activeThread = chat.threadId
    ? [...threadsState.pinnedThreads, ...threadsState.threads].find(
        (thread) => thread.id === chat.threadId,
      )
    : undefined;
  const threadTitle = activeThread?.title;

  const header = (
    <div className="flex h-12 shrink-0 items-center gap-1 border-b bg-sidebar px-2">
      <div className="min-w-0 flex-1 px-2">
        <p className="truncate text-sm font-medium">
          {threadTitle || t('panel-title', 'Assistant')}
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
      <Button variant="ghost" size="icon" className="size-7" asChild>
        <Link
          to={{
            pathname: '/settings/agent',
            search: new URLSearchParams({
              [SIDE_PANEL_QUERY_KEY]: SIDE_PANEL_CHAT_PATH,
            }).toString(),
          }}
          aria-label={t('settings', 'Settings')}
        >
          <IconSettings className="size-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={onClose}
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

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {header}
      <ChatPanel chat={chat} width="full" contextRow={contextRow} />
    </div>
  );
};
