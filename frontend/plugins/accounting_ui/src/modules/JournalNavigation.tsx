import { IconSquareLetterJ } from '@tabler/icons-react';
import { cn, NavigationMenuGroup, Sidebar, useQueryState } from 'erxes-ui';
import { useLocation } from 'react-router';
import {
  TR_JOURNAL_LABELS,
  TrJournalEnum,
} from './transactions/types/constants';

export const JournalNavigation = () => {
  const { pathname } = useLocation();
  const [journal, setJournal] = useQueryState<string>('journal');

  if (!pathname.startsWith('/accounting/records')) {
    return null;
  }

  return (
    <NavigationMenuGroup name="Журнал бичилт">
      {Object.values(TrJournalEnum).map((trJournal) => {
        const isActive = journal === trJournal;
        const label = TR_JOURNAL_LABELS[trJournal];

        return (
          <Sidebar.MenuItem key={trJournal}>
            <Sidebar.MenuButton
              isActive={isActive}
              title={label}
              onClick={() => setJournal(trJournal)}
            >
              <IconSquareLetterJ
                className={cn(
                  'text-accent-foreground',
                  isActive && 'text-primary',
                )}
              />
              <span className="min-w-0 flex-1 truncate capitalize">
                {label}
              </span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        );
      })}
    </NavigationMenuGroup>
  );
};
