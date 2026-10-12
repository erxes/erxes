import { useTranslation } from 'react-i18next';
import {
  IconClipboardTextFilled,
  IconCrane,
  IconListCheck,
  IconListDetails,
  IconRefreshAlert,
  IconSquareLetterJ,
} from '@tabler/icons-react';
import { cn, NavigationMenuLinkItem, Sidebar, useQueryState } from 'erxes-ui';
import { useLocation } from 'react-router';
import {
  TR_JOURNAL_LABELS,
  TrJournalEnum,
} from './transactions/types/constants';

function RenderJournals() {
  const { t } = useTranslation('accounting');
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
                  {t(TR_JOURNAL_LABELS[trJournal] || '')}
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
  const { t } = useTranslation('accounting');
  return (
    <>
      <NavigationMenuLinkItem
        name={t('receipts')}
        icon={IconListDetails}
        path="main"
        pathPrefix="accounting"
      />
      <NavigationMenuLinkItem
        name={t('journal-entries')}
        icon={IconListCheck}
        path="records"
        pathPrefix="accounting"
      />
      <RenderJournals />
      <NavigationMenuLinkItem
        name={t('incomplete-vouchers')}
        icon={IconCrane}
        path="odd-transactions"
        pathPrefix="accounting"
      />
      <NavigationMenuLinkItem
        name={t('report')}
        icon={IconClipboardTextFilled}
        path="journal-reports"
        pathPrefix="accounting"
      />
      <NavigationMenuLinkItem
        name={t('check-sync')}
        icon={IconRefreshAlert}
        path="check-sync"
        pathPrefix="accounting"
      />
    </>
  );
};
