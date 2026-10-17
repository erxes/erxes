import {
  IconBuilding,
  IconSitemap,
  IconSquareLetterJ,
} from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import { cn, NavigationMenuGroup, Sidebar, useQueryState } from 'erxes-ui';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useBranchesMain, useDepartmentsMain } from 'ui-modules';
import {
  TR_JOURNAL_LABELS,
  TrJournalEnum,
} from './transactions/types/constants';

const SIDEBAR_STRUCTURE_LIMIT = 100;

type ReceiptsNavigationOption = {
  _id: string;
  label: string;
  code?: string;
};

const ReceiptsNavigationItems = ({
  queryKey,
  icon: ItemIcon,
  options,
  loading,
}: {
  queryKey: 'branchId' | 'departmentId' | 'journal';
  icon: Icon;
  options: ReceiptsNavigationOption[];
  loading?: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const [selected, setSelected] = useQueryState<string>(queryKey);

  if (loading) {
    return (
      <>
        <Sidebar.MenuSkeleton showIcon />
        <Sidebar.MenuSkeleton showIcon />
      </>
    );
  }

  if (!options.length) {
    return (
      <span className="px-2 py-1 text-xs text-muted-foreground">
        {t('no-results-found')}
      </span>
    );
  }

  return (
    <>
      {options.map((option) => {
        const isActive = selected === option._id;

        return (
          <Sidebar.MenuItem key={option._id}>
            <Sidebar.MenuButton
              isActive={isActive}
              title={option.label}
              onClick={() => setSelected(isActive ? null : option._id)}
            >
              <ItemIcon
                className={cn(
                  'text-accent-foreground',
                  isActive && 'text-primary',
                )}
              />
              {option.code && (
                <span className="shrink-0 text-muted-foreground">
                  {option.code}
                </span>
              )}
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        );
      })}
    </>
  );
};

const ReceiptsBranchesNavigation = () => {
  const { t } = useTranslation('accounting');
  const { sortedBranches, loading } = useBranchesMain({
    variables: { limit: SIDEBAR_STRUCTURE_LIMIT },
  });

  return (
    <NavigationMenuGroup name={t('branch')}>
      <ReceiptsNavigationItems
        queryKey="branchId"
        icon={IconBuilding}
        loading={loading}
        options={sortedBranches.map((branch) => ({
          _id: branch._id,
          label: branch.title,
          code: branch.code,
        }))}
      />
    </NavigationMenuGroup>
  );
};

const ReceiptsDepartmentsNavigation = () => {
  const { t } = useTranslation('accounting');
  const { departments, loading } = useDepartmentsMain({
    variables: { limit: SIDEBAR_STRUCTURE_LIMIT },
  });

  return (
    <NavigationMenuGroup name={t('department')}>
      <ReceiptsNavigationItems
        queryKey="departmentId"
        icon={IconSitemap}
        loading={loading}
        options={(departments || []).map((department) => ({
          _id: department._id,
          label: department.title,
          code: department.code,
        }))}
      />
    </NavigationMenuGroup>
  );
};

export const ReceiptsNavigation = () => {
  const { t } = useTranslation('accounting');
  const { pathname } = useLocation();

  if (!pathname.startsWith('/accounting/main')) {
    return null;
  }

  return (
    <>
      <ReceiptsBranchesNavigation />
      <ReceiptsDepartmentsNavigation />
      <NavigationMenuGroup name={t('journal')}>
        <ReceiptsNavigationItems
          queryKey="journal"
          icon={IconSquareLetterJ}
          options={Object.values(TrJournalEnum).map((trJournal) => ({
            _id: trJournal,
            label: t(TR_JOURNAL_LABELS[trJournal] || ''),
          }))}
        />
      </NavigationMenuGroup>
    </>
  );
};
