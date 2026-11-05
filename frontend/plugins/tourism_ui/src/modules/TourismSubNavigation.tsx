import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, matchPath, useLocation } from 'react-router-dom';
import {
  IconBuildingCommunity,
  IconCategory,
  IconChevronRight,
  IconForms,
  IconMap,
  IconMapPin,
  IconPuzzle,
  IconRoute,
  IconSparkles,
  type TablerIcon,
} from '@tabler/icons-react';
import {
  Button,
  Collapsible,
  NavigationMenuGroup,
  Sidebar,
  Skeleton,
  TextOverflowTooltip,
  cn,
} from 'erxes-ui';
import { useBranchList } from '@/tms/hooks/BranchList';
import { IBranch } from '@/tms/types/branch';
import { usePmsBranchList } from '@/pms/hooks/usePmsBranchList';

const TMS_BRANCH_SECTIONS: {
  value: string;
  title: string;
  icon: TablerIcon;
}[] = [
  { value: 'tour', title: 'tour', icon: IconMap },
  { value: 'category', title: 'category', icon: IconCategory },
  { value: 'itinerary', title: 'itinerary', icon: IconRoute },
  { value: 'elements', title: 'elements', icon: IconPuzzle },
  { value: 'amenities', title: 'amenities', icon: IconSparkles },
  { value: 'customFields', title: 'custom-fields', icon: IconForms },
];

export const PMS_BRANCH_QUERY_KEY = 'branchId';

const TMS_BRANCH_ROUTE = '/tourism/tms/branches/:branchId';

const GROUP_CLASS_NAME =
  '[&_[data-sidebar=group-label]]:min-w-0 [&_[data-sidebar=group-label]>span]:truncate';

const getTmsBranchPath = (branchId: string, section: string) =>
  `/tourism/tms/branches/${branchId}?activeTab=${section}`;

const NavigationSkeleton = () => (
  <div className="flex flex-col gap-1">
    {['w-32', 'w-36', 'w-28'].map((width) => (
      <Skeleton key={width} className={cn('mt-1 h-4', width)} />
    ))}
  </div>
);

const NavigationLinkItem = ({
  to,
  name,
  icon: Icon,
  isActive,
  nested,
}: {
  to: string;
  name: string;
  icon: TablerIcon;
  isActive: boolean;
  nested?: boolean;
}) => (
  <Sidebar.MenuItem>
    <Sidebar.MenuButton
      asChild
      isActive={isActive}
      className={cn(nested && 'pl-7')}
    >
      <Link to={to}>
        <Icon
          className={cn('text-accent-foreground', isActive && 'text-primary')}
        />
        <TextOverflowTooltip className="min-w-0 flex-1" value={name} />
      </Link>
    </Sidebar.MenuButton>
  </Sidebar.MenuItem>
);

const TmsBranchItem = ({
  branch,
  isActive,
  hasActiveBranch,
  activeSection,
}: {
  branch: IBranch;
  isActive: boolean;
  hasActiveBranch: boolean;
  activeSection: string;
}) => {
  const { t } = useTranslation('tourism');
  const [open, setOpen] = useState(isActive || !hasActiveBranch);

  useEffect(() => {
    setOpen(isActive || !hasActiveBranch);
  }, [isActive, hasActiveBranch]);

  const name = branch.name || t('unnamed-branch');

  return (
    <Collapsible className="group/branch" open={open} onOpenChange={setOpen}>
      <Collapsible.Trigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-2 overflow-hidden p-2 text-left',
            !isActive && 'text-muted-foreground',
          )}
          aria-expanded={open}
        >
          <IconMapPin className="size-3.5 shrink-0 text-accent-foreground" />
          <TextOverflowTooltip
            className="min-w-0 flex-1 font-medium"
            value={name}
          />
          <span className="flex text-muted-foreground transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=open]/branch:rotate-90 motion-reduce:transition-none">
            <IconChevronRight className="size-3.5!" />
          </span>
        </Button>
      </Collapsible.Trigger>
      <div
        className={cn(
          'grid transition-[grid-template-rows,visibility] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
          open ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <Sidebar.Menu>
            {TMS_BRANCH_SECTIONS.map((section) => (
              <NavigationLinkItem
                key={section.value}
                to={getTmsBranchPath(branch._id, section.value)}
                name={t(section.title)}
                icon={section.icon}
                isActive={isActive && activeSection === section.value}
                nested
              />
            ))}
          </Sidebar.Menu>
        </div>
      </div>
    </Collapsible>
  );
};

const TmsSubNavigation = () => {
  const { t } = useTranslation('tourism');
  const { pathname, search } = useLocation();
  const { list, loading } = useBranchList();

  const activeBranchId =
    matchPath(TMS_BRANCH_ROUTE, pathname)?.params.branchId || '';
  const activeSection = new URLSearchParams(search).get('activeTab') || 'tour';

  return (
    <NavigationMenuGroup
      name={t('tour-management')}
      className={GROUP_CLASS_NAME}
    >
      {loading && !list.length ? (
        <NavigationSkeleton />
      ) : (
        list.map((branch) => (
          <TmsBranchItem
            key={branch._id}
            branch={branch}
            isActive={branch._id === activeBranchId}
            hasActiveBranch={!!activeBranchId}
            activeSection={activeSection}
          />
        ))
      )}
    </NavigationMenuGroup>
  );
};

const PmsSubNavigation = () => {
  const { t } = useTranslation('tourism');
  const { search } = useLocation();
  const { list, loading } = usePmsBranchList();

  const activeBranchId =
    new URLSearchParams(search).get(PMS_BRANCH_QUERY_KEY) || '';

  return (
    <NavigationMenuGroup
      name={t('property-management')}
      className={GROUP_CLASS_NAME}
    >
      {loading && !list.length ? (
        <NavigationSkeleton />
      ) : (
        <Sidebar.Menu>
          {list.map((branch) => (
            <NavigationLinkItem
              key={branch._id}
              to={`/tourism/pms?${PMS_BRANCH_QUERY_KEY}=${branch._id}`}
              name={branch.name || t('unnamed-branch')}
              icon={IconBuildingCommunity}
              isActive={branch._id === activeBranchId}
            />
          ))}
        </Sidebar.Menu>
      )}
    </NavigationMenuGroup>
  );
};

export const TourismSubNavigation = () => {
  const { pathname } = useLocation();

  if (pathname.startsWith('/tourism/tms')) {
    return <TmsSubNavigation />;
  }

  if (pathname.startsWith('/tourism/pms')) {
    return <PmsSubNavigation />;
  }

  return null;
};
