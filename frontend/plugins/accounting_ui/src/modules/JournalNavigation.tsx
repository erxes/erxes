import { getFxaTaxLabel } from '@/adjustments/fxa/utils/fxaTaxLabels';
import { cn, NavigationMenuGroup, Sidebar, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  TR_JOURNAL_LABELS,
  TR_RECORD_JOURNAL_GROUPS,
} from './transactions/types/constants';

export const JournalNavigation = () => {
  const { t } = useTranslation('accounting');
  const [journal, setJournal] = useQueryState<string>('journal');

  return (
    <Sidebar.Panel
      className="w-56 flex-none border-r lg:w-64"
      label={t('journal-entries')}
    >
      {TR_RECORD_JOURNAL_GROUPS.map(
        ({ label: groupLabel, icon: GroupIcon, journals }, index) => (
          <NavigationMenuGroup
            key={groupLabel}
            name={t(groupLabel)}
            separate={index > 0}
          >
            {journals.map((trJournal) => {
              const isActive = journal === trJournal;
              const label = getFxaTaxLabel(t, TR_JOURNAL_LABELS[trJournal]);

              return (
                <Sidebar.MenuItem key={trJournal}>
                  <Sidebar.MenuButton
                    isActive={isActive}
                    title={label}
                    onClick={() => setJournal(trJournal)}
                  >
                    <GroupIcon
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
        ),
      )}
    </Sidebar.Panel>
  );
};
