import {
  IconArrowsMaximize,
  IconChevronDown,
  IconHistory,
  IconPin,
  IconPlus,
  IconX,
} from '@tabler/icons-react';
import { Button, cn, IconTip, Popover } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RecordSidePanel } from '~/modules/side-panel/RecordSidePanel';
import { type AssistantTab, wantComposerFocus } from './assistantState';
import { HistoryDialog } from './HistoryDialog';
import { ThreadActions } from './ThreadActions';
import type { AssistantTabs } from './useAssistantTabs';
import { threadTitle, useThread } from './useThread';

const useTabTitle = (tab: AssistantTab) => {
  const { t } = useTranslation('assistant');
  const thread = useThread(tab.threadId).data;

  return {
    title: tab.threadId === null ? t('new-chat', 'New chat') : threadTitle(thread, t),
    pinned: thread?.pinned === true,
  };
};

const OpenChat = ({
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
  const { title, pinned } = useTabTitle(tab);

  return (
    <li
      className={cn(
        'group flex min-w-0 items-center gap-1 rounded-md pr-1 hover:bg-accent',
        selected && 'bg-accent',
      )}
    >
      <button
        type="button"
        aria-current={selected || undefined}
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left text-sm outline-none focus-visible:shadow-focus"
      >
        {pinned && <IconPin aria-hidden className="size-3.5 shrink-0 text-muted-foreground" />}
        <span className="min-w-0 flex-1 truncate">{title}</span>
      </button>
      <IconTip label={t('close-tab', 'Close tab (the conversation stays in history)')}>
        <Button
          variant="ghost"
          size="xs"
          aria-label={t('close-chat', 'Close {{title}}', { title })}
          onClick={onClose}
        >
          <IconX />
        </Button>
      </IconTip>
    </li>
  );
};

const ChatSwitcher = ({ tabs, onHistory }: { tabs: AssistantTabs; onHistory: () => void }) => {
  const { t } = useTranslation('assistant');
  const [open, setOpen] = useState(false);
  const active = tabs.active ?? tabs.tabs[0];
  const { title } = useTabTitle(active ?? { key: '', threadId: null });
  const extra = tabs.tabs.length - 1;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={t('open-conversations', '{{title}}, open conversations', {
          title: extra > 0 ? `${title} +${extra}` : title,
        })}
        render={<Button variant="ghost" size="sm" className="min-w-0 justify-start" />}
      >
        <span className="min-w-0 truncate font-semibold">{title}</span>
        {extra > 0 && (
          <span aria-hidden className="shrink-0 text-xs text-muted-foreground">
            +{extra}
          </span>
        )}
        <IconChevronDown aria-hidden className="shrink-0 text-muted-foreground" />
      </Popover.Trigger>
      <Popover.Content align="start" className="w-72">
        <ul className="flex flex-col gap-0.5 pb-1">
          {tabs.tabs.map((tab) => (
            <OpenChat
              key={tab.key}
              tab={tab}
              selected={tab.key === active?.key}
              onSelect={() => {
                tabs.setActiveKey(tab.key);
                setOpen(false);
              }}
              onClose={() => tabs.closeTab(tab.key)}
            />
          ))}
        </ul>
        <Button
          variant="ghost"
          size="sm"
          className="justify-start"
          onClick={() => {
            setOpen(false);
            onHistory();
          }}
        >
          <IconHistory />
          {t('history', 'Conversations')}
        </Button>
      </Popover.Content>
    </Popover>
  );
};

export const PanelHeader = ({
  tabs,
  onClose,
  onExpand,
}: {
  tabs: AssistantTabs;
  onClose: () => void;
  onExpand: () => void;
}) => {
  const { t } = useTranslation('assistant');
  const [history, setHistory] = useState(false);

  const actions = (
    <>
      <IconTip label={t('new-chat', 'New chat')}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('new-chat', 'New chat')}
          onClick={() => {
            if (tabs.active?.threadId) wantComposerFocus();

            tabs.newChat();
          }}
        >
          <IconPlus className="size-4" />
        </Button>
      </IconTip>
      <ThreadActions
        threadId={tabs.active?.threadId ?? null}
        onCloseTab={() => tabs.active && tabs.closeTab(tabs.active.key)}
        onDeleted={tabs.forgetThread}
      />
      <IconTip label={t('expand', 'Open as a page')}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('expand', 'Open as a page')}
          onClick={onExpand}
        >
          <IconArrowsMaximize className="size-4" />
        </Button>
      </IconTip>
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
    </>
  );

  return (
    <RecordSidePanel.Header
      title={<ChatSwitcher tabs={tabs} onHistory={() => setHistory(true)} />}
      heading={false}
      actions={actions}
    />
  );
};
