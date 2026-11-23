import { IconPlus, IconSparkles } from '@tabler/icons-react';
import { AppBreadcrumb, Button, Command, PageContainer, PageHeader } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { paths } from '~/lib/paths';
import { assistantOpenState, wantComposerFocus } from './assistantState';
import { Conversation } from './Conversation';
import { HistoryList } from './HistoryDialog';
import { ThreadActions } from './ThreadActions';
import { useAssistantTabs } from './useAssistantTabs';
import { threadTitle, useThread } from './useThread';

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

  useEffect(() => setPanelOpen(false), [setPanelOpen]);

  const title = tabs.active?.threadId ? threadTitle(thread, t) : t('new-chat', 'New chat');

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
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
        {tabs.active && <Conversation key={tabs.active.key} tab={tabs.active} tabs={tabs} open />}
      </div>
    </PageContainer>
  );
};
