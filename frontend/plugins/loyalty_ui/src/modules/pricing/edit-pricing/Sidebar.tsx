import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { PRICING_STEPS } from '@/pricing/edit-pricing/components';
import { IPricingPlanDetail } from '@/pricing/types';

interface PricingEditSidebarProps {
  activeTab: string;
  pricingDetail?: IPricingPlanDetail;
}

const RULE_TABS = new Set(['rules', 'common', 'quantity', 'price', 'expiry']);

export const PricingEditSidebar = ({
  activeTab,
  pricingDetail,
}: PricingEditSidebarProps) => {
  const { t } = useTranslation('loyalty');
  const steps = PRICING_STEPS.filter(
    (step) =>
      step.value !== 'participants' || pricingDetail?.priority !== 'posBase',
  );

  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {steps.map((step) => (
              <PricingEditSidebarItem
                key={step.value}
                to={step.value}
                isActive={
                  step.value === 'rules'
                    ? RULE_TABS.has(activeTab)
                    : activeTab === step.value
                }
              >
                {t(step.title)}
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
