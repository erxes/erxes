import { useCanSplitInbox } from '@/inbox/hooks/useInboxLayout';
import { inboxLayoutState } from '@/inbox/states/inboxLayoutState';
import { IconLayoutColumns, IconList } from '@tabler/icons-react';
import { Button, Tooltip } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export const ConversationDisplay = () => {
  const { t } = useTranslation('frontline');
  const [view, setView] = useAtom(inboxLayoutState);
  const canSplit = useCanSplitInbox();

  const Icon = view === 'split' ? IconLayoutColumns : IconList;

  // A narrow viewport is always single-column, so there is nothing to switch.
  if (!canSplit) {
    return null;
  }

  return (
    <Tooltip.Provider>
      <Tooltip delayDuration={0}>
        <Tooltip.Trigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView(view === 'split' ? 'list' : 'split')}
          >
            <Icon size={20} />
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
          {view === 'split' ? t('list-view') : t('split-view')}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
