import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export function ProductSettingsSidebar() {
  const { t } = useTranslation('product', { keyPrefix: 'similarity-config' });
  const { t: tSidebar } = useTranslation('common', { keyPrefix: 'sidebar' });
  const { pathname } = useLocation();
  return (
    <Sidebar.Panel className="flex-none border-r" label={tSidebar('products')}>
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={pathname === '/settings/products'}
                asChild
              >
                <Link to="/settings/products">General</Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={pathname === '/settings/products/uom'}
                asChild
              >
                <Link to="/settings/products/uom">Uom</Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={pathname === '/settings/products/similarity-configs'}
                asChild
              >
                <Link to="/settings/products/similarity-configs">
                  {t('similarity-configs', 'Similarity configs')}
                </Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    </Sidebar.Panel>
  );
}
