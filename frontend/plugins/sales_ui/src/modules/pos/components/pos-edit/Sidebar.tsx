import { IconPuzzle, Icon } from '@tabler/icons-react';
import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { POS_EDIT_STEP_GROUPS, POS_RELATION_TAB_PREFIX } from '@/pos/constants';
import {
  relationSettingsModuleKey,
  useRelationSettingsModules,
} from 'ui-modules';

interface PosEditSidebarProps {
  activeTab: string;
  // Other plugins' tabs need a saved POS to work on.
  posId?: string;
}

export const PosEditSidebar = ({ activeTab, posId }: PosEditSidebarProps) => {
  const { t } = useTranslation('sales');
  const relationModules = useRelationSettingsModules();
  const lastGroupIndex = POS_EDIT_STEP_GROUPS.length - 1;

  return (
    <Sidebar.Panel className="flex-none border-r" label={t('pos')}>
      {POS_EDIT_STEP_GROUPS.map((group, index) => (
        <Sidebar.Group key={group.title}>
          <Sidebar.GroupLabel>{t(group.title)}</Sidebar.GroupLabel>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {group.steps.map((step) => (
                <PosEditSidebarItem
                  key={step.value}
                  to={step.value}
                  icon={step.icon}
                  isActive={activeTab === step.value}
                >
                  {t(step.title)}
                </PosEditSidebarItem>
              ))}
              {posId &&
                index === lastGroupIndex &&
                relationModules.map((module) => {
                  const tab = `${POS_RELATION_TAB_PREFIX}${relationSettingsModuleKey(
                    module,
                  )}`;

                  return (
                    <PosEditSidebarItem
                      key={tab}
                      to={tab}
                      icon={IconPuzzle}
                      isActive={activeTab === tab}
                    >
                      {module.label || module.name}
                    </PosEditSidebarItem>
                  );
                })}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      ))}
    </Sidebar.Panel>
  );
};

export const PosEditSidebarItem = ({
  to,
  icon: ItemIcon,
  children,
  isActive,
}: {
  to: string;
  icon: Icon;
  children: React.ReactNode;
  isActive: boolean;
}) => {
  const location = useLocation();
  const currentUrl = `${location.pathname}?activeTab=${to}`;

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild isActive={isActive}>
        <Link to={currentUrl}>
          <ItemIcon />
          <span>{children}</span>
        </Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};
