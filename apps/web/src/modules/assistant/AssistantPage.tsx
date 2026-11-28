import { IconArrowLeft, IconPlus, IconSparkles } from '@tabler/icons-react';
import {
  AppBreadcrumb,
  Button,
  Command,
  IconTip,
  PageContainer,
  PageHeader,
  Spinner,
} from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useQueryState } from 'nuqs';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { paths } from '~/lib/paths';
import { assistantOpenState, openThreadAction, wantComposerFocus } from './assistantState';
import { lazyNamed } from '~/lib/lazyNamed';
import { HistoryList } from './HistoryDialog';
import { ThreadActions } from './ThreadActions';
import { useAssistantTabs } from './useAssistantTabs';
import { threadTitle, useThread } from './useThread';

const cameFrom = z.object({ from: z.string().startsWith('/') });

const Conversation = lazyNamed(() => import('./Conversation'), 'Conversation');

const ChatsRail = ({ tabs }: { tabs: ReturnType<typeof useAssistantTabs> }) => {
  const { t } = useTranslation('assistant');

  return (
    <nav
      aria-label={t('history', 'Conversations')}
      className="flex w-64 shrink-0 flex-col gap-2 border-r bg-sidebar p-2 max-md:hidden"
    >
      <Button
        onClick={() => {
          wantComposerFocus();
          tabs.newChat();
        }}
      >
        <IconPlus />
        {t('new-chat', 'New chat')}
      </Button>
      <Command className="min-h-0 flex-1">
        <Command.Input placeholder={t('search-history', 'Search conversations')} />
        <Command.List className="max-h-none flex-1">
          <HistoryList onOpen={tabs.openThread} />
        </Command.List>
      </Command>
    </nav>
  );
};

export const AssistantPage = () => {
  const { t } = useTranslation('assistant');
  const tabs = useAssistantTabs();
  const setPanelOpen = useSetAtom(assistantOpenState);
  const thread = useThread(tabs.active?.threadId ?? null).data;

  const navigate = useNavigate();
  const from = cameFrom.safeParse(useLocation().state).data?.from ?? paths.home;

  useEffect(() => setPanelOpen(false), [setPanelOpen]);

  const [linked, setLinked] = useQueryState('thread');
  const openThread = useSetAtom(openThreadAction);

  useEffect(() => {
    if (!linked) return;

    openThread(linked);
    void setLinked(null);
  }, [linked, openThread, setLinked]);

  const title = tabs.active?.threadId ? threadTitle(thread, t) : t('new-chat', 'New chat');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <IconTip label={t('back', 'Back')}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('back', 'Back')}
              onClick={() => {
                void navigate(from);
                setPanelOpen(true);
              }}
            >
              <IconArrowLeft />
            </Button>
          </IconTip>
          <AppBreadcrumb
            items={[
              { label: t('title', 'Assistant'), to: paths.assistant, icon: IconSparkles },
              { label: title, to: paths.assistant },
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          <ThreadActions
            threadId={tabs.active?.threadId ?? null}
            onCloseTab={() => tabs.active && tabs.closeTab(tabs.active.key)}
            onDeleted={tabs.forgetThread}
          />
        </PageHeader.End>
      </PageHeader>
      <div className="flex min-h-0 flex-1">
        <ChatsRail tabs={tabs} />
        <Suspense
          fallback={
            <div className="flex flex-1 items-center justify-center">
              <Spinner />
            </div>
          }
        >
          {tabs.active && <Conversation key={tabs.active.key} tab={tabs.active} tabs={tabs} open />}
        </Suspense>
      </div>
    </PageContainer>
  );
};
