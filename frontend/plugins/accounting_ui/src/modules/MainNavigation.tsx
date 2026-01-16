import {
  IconClipboardTextFilled,
  IconCrane,
  IconListCheck,
  IconListDetails,
  IconSquareLetterJ,
} from '@tabler/icons-react';
import { cn, NavigationMenuLinkItem, Sidebar, useQueryState } from 'erxes-ui';
import { useLocation } from 'react-router-dom';
import {
  TR_JOURNAL_LABELS,
  TrJournalEnum,
} from './transactions/types/constants';

function RenderJournals() {
  const path = 'accounting/records';
  const { pathname } = useLocation();
  const [journal, setJournal] = useQueryState<string>('journal');

  if (!pathname.startsWith(`/${path}`)) {
    return null;
  }

  return (
    <Sidebar.GroupContent>
      <Sidebar.Menu>
        {Object.values(TrJournalEnum).map((trJournal) => (
          <Sidebar.MenuItem key={trJournal}>
            <Sidebar.MenuButton
              asChild
              isActive={journal === trJournal}
              className="pl-6 font-medium"
              onClick={() => setJournal(trJournal)}
            >
              <div>
                <IconSquareLetterJ
                  className={cn(
                    'text-accent-foreground',
                    journal === trJournal && 'text-primary',
                  )}
                />
                <span className="capitalize">
                  {TR_JOURNAL_LABELS[trJournal]}
                </span>
              </div>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        ))}
      </Sidebar.Menu>
    </Sidebar.GroupContent>
  );
}

export const MainNavigation = () => {
  return (
    <>
      <NavigationMenuLinkItem
        name="Баримтууд"
        icon={IconListDetails}
        path="main"
        pathPrefix="accounting"
      />
      <NavigationMenuLinkItem
        name="Журнал бичилт"
        icon={IconListCheck}
        path="records"
        pathPrefix="accounting"
      />
      <RenderJournals />
      <NavigationMenuLinkItem
        name="Бүрэн бус баримтууд"
        icon={IconCrane}
        path="odd-transactions"
        pathPrefix="accounting"
      />
      <NavigationMenuLinkItem
        name="Тайлан"
        icon={IconClipboardTextFilled}
        path="journal-reports"
        pathPrefix="accounting"
      />
    </>
  );
};
