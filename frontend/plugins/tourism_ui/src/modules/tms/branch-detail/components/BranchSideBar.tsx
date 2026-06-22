import { Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';

const steps = [
  { value: 'tour', title: 'Tour' },
  { value: 'category', title: 'Category' },
  { value: 'itinerary', title: 'Itinerary' },
  { value: 'elements', title: 'Elements' },
  { value: 'amenities', title: 'Amenities' },
  { value: 'customFields', title: 'Custom Fields' },
];

export const BranchSideBar = ({ activeTab }: { activeTab: string }) => {
  const { t } = useTranslation('tourism');
  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupLabel>{t('tour-management')}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            {steps.map((step) => (
              <BranchSidebarItem
                key={step.value}
                to={step.value}
                isActive={activeTab === step.value}
              >
                {step.title}
              </BranchSidebarItem>
            ))}
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};

export const BranchSidebarItem = ({
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
