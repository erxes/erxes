import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';
import { PRICING_STEPS } from '@/pricing/edit-pricing/components';

interface PricingEditSidebarProps {
  activeTab: string;
}

export const PricingEditSidebar = ({ activeTab }: PricingEditSidebarProps) => {
  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {PRICING_STEPS.map((step) => (
              <PricingEditSidebarItem
                key={step.value}
                to={step.value}
                isActive={activeTab === step.value}
              >
                {step.title}
              </PricingEditSidebarItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

export const PricingEditSidebarItem = ({
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
