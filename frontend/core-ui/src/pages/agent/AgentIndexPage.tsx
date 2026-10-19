import {
  IconArrowAutofitWidth,
  IconHistory,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconPlus,
  IconPuzzle,
  IconSettings,
  IconSparkles,
} from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  DropdownMenu,
  Separator,
  Tooltip,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';

import { ChatPanel } from '@/agent/components/ChatPanel';
import { ThreadList } from '@/agent/components/ThreadList';
import { ThreadsDrawer } from '@/agent/components/ThreadsDrawer';
import { AgentThreadActionsMenu } from '@/agent/components/AgentThreadActionsMenu';
import { useAgentsChat } from '@/agent/hooks/useAgentsChat';
import { useAgentsThreads } from '@/agent/hooks/useAgentsThreads';
import {
  agentChatWidthState,
  agentThreadsSidebarOpenState,
} from '@/agent/states/agentPanelStates';
import type { AgentChatWidth } from '@/agent/utils/chatWidth';

const isAgentChatWidth = (value: string): value is AgentChatWidth =>
  value === 'standard' || value === 'wide' || value === 'full';
import { AppPath } from '@/types/paths/AppPath';

const truncateTitle = (title: string, max = 40): string =>
  title.length > max ? `${title.slice(0, max).trimEnd()}…` : title;

const WIDTH_OPTIONS: { value: AgentChatWidth; labelKey: string }[] = [
  { value: 'standard', labelKey: 'width-standard' },
  { value: 'wide', labelKey: 'width-wide' },
  { value: 'full', labelKey: 'width-full' },
];

/**
 * Full-page agents chat: a collapsible conversation sidebar beside the
 * live chat, or — below `lg`, where a permanent sidebar would leave the
 * transcript cramped — behind a left drawer opened from the header.
 *
 * `/agent/:threadId` deep-links into one thread; the route param is the
 * source of truth and `openThread` follows it.
 */
export const AgentIndexPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'agent' });
  const { threadId: routeThreadId } = useParams<{ threadId: string }>();
  const navigate = useNavigate();
  const chat = useAgentsChat({ sessionScope: 'page' });
  const { startNewConversation, openThread, threadId } = chat;
  const threadsState = useAgentsThreads();
  const [threadsOpen, setThreadsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useAtom(agentThreadsSidebarOpenState);
  const [chatWidth, setChatWidth] = useAtom(agentChatWidthState);

  useEffect(() => {
    if (routeThreadId && routeThreadId !== threadId) {
      openThread(routeThreadId).catch(() => {
        // A deleted or foreign thread falls back to a new conversation.
        navigate('/agent', { replace: true });
      });
    }
    // `openThread` is stable; `threadId` intentionally omitted — a newly
    // created thread must not retrigger the deep-link open.
  }, [routeThreadId, openThread, navigate]);

  // Keep the URL in sync when the first send resolves a thread id.
  useEffect(() => {
    if (!routeThreadId && threadId) {
      navigate(`/agent/${threadId}`, { replace: true });
    }
  }, [routeThreadId, threadId, navigate]);

  // Stable handlers so the memoized `ThreadList` can skip the chat's
  // per-delta re-renders.
  const handleNewConversation = useCallback(() => {
    void startNewConversation();
    setThreadsOpen(false);
    if (routeThreadId) {
      navigate('/agent');
    }
  }, [startNewConversation, routeThreadId, navigate]);

  const handleSelectThread = useCallback(
    (selectedThreadId: string) => {
      setThreadsOpen(false);
      navigate(`/agent/${selectedThreadId}`);
    },
    [navigate],
  );

  const handleThreadDeleted = useCallback(
    (deletedThreadId: string) => {
      if (threadId === deletedThreadId) {
        void startNewConversation();
        navigate('/agent');
      }
    },
    [threadId, startNewConversation, navigate],
  );

  const activeThread = threadId
    ? [...threadsState.pinnedThreads, ...threadsState.threads].find(
        (thread) => thread.id === threadId,
      )
    : undefined;
  const activeThreadTitle =
    activeThread?.title ||
    (threadId ? t('conversation', 'Conversation') : '');

  return (
    <div className="flex h-full flex-col text-sm">
      <PageHeader>
        <PageHeader.Start className="min-w-0 flex-[0_1_auto]">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setThreadsOpen(true)}
            aria-label={t('open-conversations', 'Open conversations')}
            title={t('conversations', 'Conversations')}
          >
            <IconHistory />
          </Button>
          <Tooltip.Provider delayDuration={200}>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:inline-flex"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  aria-label={
                    sidebarOpen
                      ? t('collapse-sidebar', 'Collapse conversations')
                      : t('expand-sidebar', 'Expand conversations')
                  }
                >
                  {sidebarOpen ? (
                    <IconLayoutSidebarLeftCollapse />
                  ) : (
                    <IconLayoutSidebarLeftExpand />
                  )}
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>
                {sidebarOpen
                  ? t('collapse-sidebar', 'Collapse conversations')
                  : t('expand-sidebar', 'Expand conversations')}
              </Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to={`/${AppPath.Agent}`}>
                    <IconSparkles />
                    {t('title', 'AI Agent')}
                  </Link>
                </Button>
              </Breadcrumb.Item>
              {threadId && (
                <>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item className="min-w-0">
                    <Breadcrumb.Page className="block max-w-[9rem] truncate sm:max-w-[16rem] lg:max-w-[24rem]">
                      {truncateTitle(activeThreadTitle)}
                    </Breadcrumb.Page>
                  </Breadcrumb.Item>
                </>
              )}
            </Breadcrumb.List>
          </Breadcrumb>
          {threadId && (
            <AgentThreadActionsMenu
              threadId={threadId}
              title={activeThread?.title ?? ''}
              pinned={activeThread?.pinned === true}
              messages={chat.messages}
              onDeleted={() => handleThreadDeleted(threadId)}
            />
          )}
          <div className="hidden items-center gap-2 sm:flex">
            <Separator.Inline />
            <PageHeader.FavoriteToggleButton
            breadcrumb={
              threadId
                ? [t('title', 'AI Agent'), truncateTitle(activeThreadTitle)]
                : [t('title', 'AI Agent')]
            }
              icon="IconSparkles"
            />
          </div>
        </PageHeader.Start>
        <PageHeader.End className="gap-1.5 sm:gap-2">
          <Button
            variant="ghost"
            asChild
            className="gap-1.5"
            aria-label={t('capabilities', 'Capabilities')}
          >
            <Link to={`/${AppPath.AgentCapabilities}`}>
              <IconPuzzle />
              <span className="hidden sm:inline">
                {t('capabilities', 'Capabilities')}
              </span>
            </Link>
          </Button>
          <DropdownMenu>
            <Tooltip.Provider delayDuration={200}>
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <DropdownMenu.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hidden lg:inline-flex"
                      aria-label={t('chat-width', 'Chat width')}
                    >
                      <IconArrowAutofitWidth />
                    </Button>
                  </DropdownMenu.Trigger>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  {t('chat-width', 'Chat width')}
                </Tooltip.Content>
              </Tooltip>
            </Tooltip.Provider>
            <DropdownMenu.Content align="end">
              <DropdownMenu.RadioGroup
                value={chatWidth}
                onValueChange={(value) => {
                  if (isAgentChatWidth(value)) {
                    setChatWidth(value);
                  }
                }}
              >
                {WIDTH_OPTIONS.map((option) => (
                  <DropdownMenu.RadioItem
                    key={option.value}
                    value={option.value}
                  >
                    {t(option.labelKey, option.value)}
                  </DropdownMenu.RadioItem>
                ))}
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu>
          <Tooltip.Provider delayDuration={200}>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  aria-label={t('settings', 'Settings')}
                >
                  <Link to="/settings/agent">
                    <IconSettings />
                  </Link>
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>{t('settings', 'Settings')}</Tooltip.Content>
            </Tooltip>
          </Tooltip.Provider>
          <Button
            onClick={handleNewConversation}
            aria-label={t('new-conversation', 'New conversation')}
          >
            <IconPlus />
            <span className="hidden sm:inline">
              {t('new-conversation', 'New conversation')}
            </span>
          </Button>
        </PageHeader.End>
      </PageHeader>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {sidebarOpen && (
          <aside className="hidden w-72 flex-none border-r lg:block">
            <ThreadList
              threadsState={threadsState}
              activeThreadId={threadId}
              onSelectThread={handleSelectThread}
              onNewConversation={handleNewConversation}
              onThreadDeleted={handleThreadDeleted}
            />
          </aside>
        )}
        <main className="flex min-w-0 flex-1">
          <ChatPanel chat={chat} width={chatWidth} variant="page" />
        </main>
      </div>

      <ThreadsDrawer
        open={threadsOpen}
        onOpenChange={setThreadsOpen}
        threadsState={threadsState}
        activeThreadId={threadId}
        onSelectThread={handleSelectThread}
        onNewConversation={handleNewConversation}
        onThreadDeleted={handleThreadDeleted}
      />
    </div>
  );
};
