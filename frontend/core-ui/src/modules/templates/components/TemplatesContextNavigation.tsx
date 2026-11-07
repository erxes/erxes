import { IconBrandDatabricks, IconCategory } from '@tabler/icons-react';
import { NavigationMenuGroup, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';

export const TemplatesContextNavigation = () => {
  const { t } = useTranslation('templates', { keyPrefix: 'template' });
  const { pathname } = useLocation();
  const isCategoryPage = pathname.startsWith('/templates/categories');

  return (
    <NavigationMenuGroup name={t('templates')}>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton isActive={!isCategoryPage} asChild>
          <NavLink to="/templates" end>
            <IconBrandDatabricks />
            <span>{t('templates')}</span>
          </NavLink>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton isActive={isCategoryPage} asChild>
          <NavLink to="/templates/categories">
            <IconCategory />
            <span>{t('categories')}</span>
          </NavLink>
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </NavigationMenuGroup>
  );
};
