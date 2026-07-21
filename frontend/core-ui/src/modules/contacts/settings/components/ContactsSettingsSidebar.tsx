import { useTranslation } from 'react-i18next';
import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';

export const ContactsSidebar = () => {
  const { t } = useTranslation('contact');
  const { pathname } = useLocation();
  return (
    <Sidebar collapsible="none" className="border-r flex-none">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={pathname === '/settings/contacts'}
                asChild
              >
                <Link to="/settings/contacts">{t('customers', 'Customers')}</Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={pathname === '/settings/contacts/companies'}
                asChild
              >
                <Link to="/settings/contacts/companies">{t('companies', 'Companies')}</Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar>
  );
};
