import {
  IconPin,
  IconPinnedOff,
  IconSettings,
  IconX,
} from '@tabler/icons-react';
import { Button, toast } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SIDE_PANEL_CHAT_PATH, SIDE_PANEL_QUERY_KEY } from 'ui-modules';
import { useTranslation } from 'react-i18next';

import {
  agentSidePanelThreadRequestState,
  type AgentPanelMode,
} from '../states/agentPanelStates';
import { getPageRecordFromLocation } from '../references/getPageRecordFromLocation';
import { useAgentActivity } from '../hooks/useAgentActivity';
import { useAgentsChat } from '../hooks/useAgentsChat';
import { useAgentsThreads } from '../hooks/useAgentsThreads';
import { useNavigationCatalog } from '../hooks/useNavigationCatalog';
import { AgentFileDropZone } from './AgentFileDropZone';
import { AgentPageContextChip } from './AgentPageContextChip';
import { AgentThreadActionsMenu } from './AgentThreadActionsMenu';
import { ChatPanel } from './ChatPanel';
import type { IComposerAttachHandle } from './Composer';
import { ThreadTabs } from './ThreadTabs';
import { useAgentsThreadActions } from '../hooks/useAgentsThreadActions';

/** Real Assistant chat shared by the floating Lens and docked Companion. */
export const AgentSidePanel = ({
  onClose,
  active,
  mode,
  onModeChange,
}: {
  onClose: () => void;
  active: boolean;
  mode: AgentPanelMode;
  onModeChange: (mode: AgentPanelMode) => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const threadRequest = useAtomValue(agentSidePanelThreadRequestState);
  const setThreadRequest = useSetAtom(agentSidePanelThreadRequestState);
  const location = useLocation();
  const navigation = useNavigationCatalog();
  const chat = useAgentsChat({ sessionScope: 'panel' });
  const threadsState = useAgentsThreads();
  const currentThreadId = useRef(chat.threadId);
  currentThreadId.current = chat.threadId;
  useAgentActivity(chat, active);
  const { remove } = useAgentsThreadActions();
  const [dismissedContextKey, setDismissedContextKey] = useState<string | null>(
    null,
  );
  const attachRef = useRef<IComposerAttachHandle>(null);

  const pageRecord = useMemo(
    () => getPageRecordFromLocation(location.pathname, location.search),
    [location.pathname, location.search],
  );
  const pageLabel = useMemo(() => {
    let closest: { path: string; label: string } | undefined;

    for (const entry of navigation) {
      const path = entry.path.split('?')[0];
      if (path === location.pathname) return entry.label;
      if (
        location.pathname.startsWith(`${path}/`) &&
        (closest?.path.length ?? 0) < path.length
      ) {
        closest = { path, label: entry.label };
      }
    }

    return closest?.label ?? t('current-page', 'Current page');
  }, [navigation, location.pathname, t]);
  const contextKey = pageRecord
    ? `${pageRecord.type}:${pageRecord.id}`
    : `page:${location.pathname}`;
  const contextVisible = dismissedContextKey !== contextKey;
  const setPageContext = chat.setPageContext;

  useEffect(() => {
    setPageContext(
      contextVisible
        ? { path: location.pathname, record: pageRecord }
        : undefined,
    );
  }, [setPageContext, location.pathname, pageRecord, contextVisible]);

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
  const modeLabel =
    mode === 'lens'
      ? t('pin-to-side', 'Pin to side panel')
      : t('unpin-and-float', 'Unpin and float over page');
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
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() =>
              onModeChange(mode === 'lens' ? 'companion' : 'lens')
            }
            aria-label={modeLabel}
            title={modeLabel}
          >
            {mode === 'lens' ? (
              <IconPin className="size-4" />
            ) : (
              <IconPinnedOff className="size-4" />
            )}
          </Button>
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

  const contextRow = contextVisible ? (
    <AgentPageContextChip
      record={pageRecord}
      pageLabel={pageLabel}
      onDismiss={() => setDismissedContextKey(contextKey)}
    />
  ) : null;

  return (
    <AgentFileDropZone
      attachRef={attachRef}
      className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      {header}
      <ChatPanel
        chat={chat}
        width="full"
        contextRow={contextRow}
        attachRef={attachRef}
      />
    </AgentFileDropZone>
  );
};
