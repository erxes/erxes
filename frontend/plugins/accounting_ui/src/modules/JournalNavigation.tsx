import { IconSquareLetterJ } from '@tabler/icons-react';
import { cn, NavigationMenuGroup, Sidebar, useQueryState } from 'erxes-ui';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  TR_JOURNAL_LABELS,
  TrJournalEnum,
} from './transactions/types/constants';

export const JournalNavigation = () => {
  const { t } = useTranslation('accounting');
  const { pathname } = useLocation();
  const [journal, setJournal] = useQueryState<string>('journal');

  if (!pathname.startsWith('/accounting/records')) {
    return null;
  }

  return (
    <NavigationMenuGroup name={t('journal-entries')}>
      {Object.values(TrJournalEnum).map((trJournal) => {
        const isActive = journal === trJournal;
        const label = t(TR_JOURNAL_LABELS[trJournal]);

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
