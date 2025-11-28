import {
  IconCaretLeftRight,
  IconCrane,
  IconListCheck,
  IconListDetails,
  IconSquareLetterJ
} from '@tabler/icons-react';
import { cn, NavigationMenuLinkItem, Sidebar, useQueryState } from 'erxes-ui';
import { useLocation } from 'react-router';
import { TR_JOURNAL_LABELS, TrJournalEnum } from './transactions/types/constants';


function RenderJournals() {
  const path = 'accounting/records';
  const { pathname } = useLocation();

  if (!pathname.startsWith(`/${path}`)) {
    return null;
  }

  const [journal, setJournal] = useQueryState<string>('journal');

  return (
    <Sidebar.GroupContent>
      <Sidebar.Menu>
        {Object.values(TrJournalEnum).map((trJournal) => (
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              asChild
              isActive={journal === trJournal}
              className='pl-6 font-medium'
              onClick={() => setJournal(trJournal)}
            >
              <div>
                <IconSquareLetterJ className={cn(
                  'text-accent-foreground',
                  journal === trJournal && 'text-primary',
                )} />
                <span className="capitalize">{TR_JOURNAL_LABELS[trJournal]}</span>
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
      <NavigationMenuLinkItem name='Баримтууд' icon={IconListDetails} path="accounting/main" />
      <NavigationMenuLinkItem name='Журнал бичилт' icon={IconListCheck} path="accounting/records" />
      {RenderJournals()}
      <NavigationMenuLinkItem name='Бүрэн бус баримтууд' icon={IconCrane} path="accounting/odd-transactions" />
    </>
  );
};
