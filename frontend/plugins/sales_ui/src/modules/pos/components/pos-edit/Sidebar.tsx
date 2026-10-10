import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { getSteps, POS_RELATION_TAB_PREFIX } from '@/pos/constants';
import {
  relationSettingsModuleKey,
  useRelationSettingsModules,
} from 'ui-modules';

interface PosEditSidebarProps {
  posType?: string;
  activeTab: string;
  // Other plugins' tabs need a saved POS to work on.
  posId?: string;
}

export const PosEditSidebar = ({
  posType,
  activeTab,
  posId,
}: PosEditSidebarProps) => {
  const { t } = useTranslation('sales');
  const steps = getSteps();
  const relationModules = useRelationSettingsModules();

  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {steps.map((step) => (
              <PosEditSidebarItem
                key={step.value}
                to={step.value}
                isActive={activeTab === step.value}
              >
                {t(step.title)}
              </PosEditSidebarItem>
            ))}
            {posId &&
              relationModules.map((module) => {
                const tab = `${POS_RELATION_TAB_PREFIX}${relationSettingsModuleKey(
                  module,
                )}`;

                return (
                  <PosEditSidebarItem
                    key={tab}
                    to={tab}
                    isActive={activeTab === tab}
                  >
                    {module.label || module.name}
                  </PosEditSidebarItem>
                );
              })}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

export const PosEditSidebarItem = ({
  to,
  children,
  isActive,
}: {
  to: string;
  children: React.ReactNode;
  isActive: boolean;
}) => {
  const location = useLocation();
  const currentUrl = `${location.pathname}?activeTab=${to}`;

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild isActive={isActive}>
        <Link to={currentUrl}>{children}</Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};
