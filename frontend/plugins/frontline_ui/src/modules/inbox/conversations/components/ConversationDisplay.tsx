import { inboxLayoutState } from '@/inbox/states/inboxLayoutState';
import { IconLayoutColumns, IconList } from '@tabler/icons-react';
import { Button, Tooltip } from 'erxes-ui';
import { useAtom } from 'jotai';

export const ConversationDisplay = () => {
  const [view, setView] = useAtom(inboxLayoutState);

  const Icon = view === 'split' ? IconLayoutColumns : IconList;

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
          {view === 'split' ? 'List view' : 'Split view'}
        </Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
