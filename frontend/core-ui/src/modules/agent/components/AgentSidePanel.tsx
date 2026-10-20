import { IconSettings, IconX } from '@tabler/icons-react';
import { Button, toast } from 'erxes-ui';
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
import { ThreadTabs } from './ThreadTabs';
import { useAgentsThreadActions } from '../hooks/useAgentsThreadActions';

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
  const currentThreadId = useRef(chat.threadId);
  currentThreadId.current = chat.threadId;
  useAgentActivity(chat, active);
  const { remove } = useAgentsThreadActions();
  const [contextDismissed, setContextDismissed] = useState(false);

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
  }, [chat]);

  const handleSelectThread = useCallback(
    (selectedThreadId: string) => {
      void chat.openThread(selectedThreadId).catch((error: unknown) => {
        toast({
          title: 'Could not open session',
          description: error instanceof Error ? error.message : undefined,
          variant: 'destructive',
        });
      });
    },
    [chat],
  );

  const activeThread = chat.threadId
    ? [...threadsState.pinnedThreads, ...threadsState.threads].find(
        (thread) => thread.id === chat.threadId,
      )
    : undefined;
  const header = (
    <ThreadTabs
      threadsState={threadsState}
      activeThreadId={chat.threadId}
      onSelect={handleSelectThread}
      onNew={handleNewConversation}
      onDelete={remove}
      onDeleted={(deletedId, nextId) => {
        try {
          sessionStorage.removeItem(`agents-active-run:${deletedId}`);
          sessionStorage.removeItem(`agents-in-flight-prompt:${deletedId}`);
        } catch {
          /* Storage may be disabled; selection must still work. */
        }
        if (currentThreadId.current === deletedId) {
          if (nextId) handleSelectThread(nextId);
          else handleNewConversation();
        }
      }}
      controls={
        <>
          {chat.threadId && (
            <AgentThreadActionsMenu
              threadId={chat.threadId}
              title={activeThread?.title ?? ''}
              pinned={activeThread?.pinned === true}
              messages={chat.messages}
            />
          )}
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
        </>
      }
    />
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
