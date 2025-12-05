import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';
import { getSteps } from '../../constants';

interface PosEditSidebarProps {
  posType?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const PosEditSidebar = ({
  posType,
  activeTab,
  onTabChange,
}: PosEditSidebarProps) => {
  const steps = getSteps(posType || null);

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
                onClick={() => onTabChange(step.value)}
              >
                {step.title}
              </PosEditSidebarItem>
            ))}
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
  onClick,
}: {
  to: string;
  children: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}) => {
  const location = useLocation();
  const currentUrl = `${location.pathname}?activeTab=${to}`;

  return (
    <Sidebar.MenuItem>
      <Sidebar.MenuButton asChild isActive={isActive}>
        <Link to={currentUrl} onClick={onClick}>
          {children}
        </Link>
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );
};
