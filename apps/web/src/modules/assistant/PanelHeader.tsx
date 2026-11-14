import { IconHistory, IconPin, IconPlus, IconX } from '@tabler/icons-react';
import { Button, cn } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconTip } from '~/components/IconTip';
import type { AssistantTab } from './assistantState';
import { HistoryDialog } from './HistoryDialog';
import { ThreadActions } from './ThreadActions';
import type { AssistantTabs } from './useAssistantTabs';
import { useThread } from './useThread';

const Tab = ({
  tab,
  selected,
  onSelect,
  onClose,
}: {
  tab: AssistantTab;
  selected: boolean;
  onSelect: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation('assistant');
  const thread = useThread(tab.threadId).data;
  const title = thread?.title ?? t('new-chat', 'New chat');

  return (
    <button
      type="button"
      role="tab"
      id={`assistant-tab-${tab.key}`}
      aria-selected={selected}
      aria-controls="assistant-conversation"
      tabIndex={selected ? 0 : -1}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key !== 'Delete') return;

        event.preventDefault();
        onClose();
      }}
      className={cn(
        'group flex h-8 max-w-44 min-w-0 shrink-0 items-center gap-1 rounded-md pr-1 pl-2.5 text-sm outline-none focus-visible:shadow-focus',
        selected ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/60',
      )}
    >
      {thread?.pinned && <IconPin aria-hidden className="size-3.5 shrink-0" />}
      <span className="min-w-0 flex-1 truncate text-left">{title}</span>
      <span
        aria-hidden
        title={t('close-tab', 'Close tab (the conversation stays in history)')}
        className={cn(
          'inline-flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100 hover:bg-background hover:text-foreground',
          selected && 'opacity-100',
        )}
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <IconX className="size-3" />
      </span>
    </button>
  );
};

const moveFocus = (event: React.KeyboardEvent<HTMLDivElement>, tabs: AssistantTabs) => {
  const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
  const index = tabs.tabs.findIndex((tab) => tab.key === tabs.active?.key);

  if (!step || index < 0) return;

  const next = tabs.tabs[(index + step + tabs.tabs.length) % tabs.tabs.length];

  if (!next) return;

  event.preventDefault();
  tabs.setActiveKey(next.key);
  document.getElementById(`assistant-tab-${next.key}`)?.focus();
};

const TabStrip = ({ tabs }: { tabs: AssistantTabs }) => {
  const { t } = useTranslation('assistant');

  return (
    <div
      role="tablist"
      tabIndex={-1}
      aria-label={t('open-conversations', 'Open conversations')}
      onKeyDown={(event) => moveFocus(event, tabs)}
      className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto hide-scroll"
    >
      {tabs.tabs.map((tab) => (
        <Tab
          key={tab.key}
          tab={tab}
          selected={tab.key === tabs.active?.key}
          onSelect={() => tabs.setActiveKey(tab.key)}
          onClose={() => tabs.closeTab(tab.key)}
        />
      ))}
    </div>
  );
};

export const PanelHeader = ({ tabs, onClose }: { tabs: AssistantTabs; onClose: () => void }) => {
  const { t } = useTranslation('assistant');
  const [history, setHistory] = useState(false);

  return (
    <header className="flex h-12 shrink-0 items-center gap-1 border-b px-2">
      <TabStrip tabs={tabs} />
      <IconTip label={t('new-chat', 'New chat')}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('new-chat', 'New chat')}
          onClick={tabs.newChat}
        >
          <IconPlus className="size-4" />
        </Button>
      </IconTip>
      <IconTip label={t('history', 'Conversations')}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('history', 'Conversations')}
          onClick={() => setHistory(true)}
        >
          <IconHistory className="size-4" />
        </Button>
      </IconTip>
      <ThreadActions
        threadId={tabs.active?.threadId ?? null}
        onCloseTab={() => tabs.active && tabs.closeTab(tabs.active.key)}
        onDeleted={tabs.forgetThread}
      />
      <IconTip label={t('close-panel', 'Close assistant')} hotkey="Ctrl+J">
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('close-panel', 'Close assistant')}
          onClick={onClose}
        >
          <IconX className="size-4" />
        </Button>
      </IconTip>
      <HistoryDialog
        open={history}
        onOpenChange={setHistory}
        onOpen={(threadId) => {
          tabs.openThread(threadId);
          setHistory(false);
        }}
      />
    </header>
  );
};
