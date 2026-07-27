import { Sidebar } from 'erxes-ui';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
export function ProductSettingsSidebar() {
  const { t } = useTranslation('product', { keyPrefix: 'similarity-config' });
  const { t: tp } = useTranslation('product');
  const { pathname } = useLocation();
  return (
    <Sidebar collapsible="none" className="flex-none border-r">
      <Sidebar.Group>
        <Sidebar.GroupContent>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={pathname === '/settings/products'}
                asChild
              >
                <Link to="/settings/products">{tp('general', 'General')}</Link>
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton
                isActive={pathname === '/settings/products/uom'}
                asChild
              >
                <Link to="/settings/products/uom">{tp('uom', 'UOM')}</Link>
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
    </Sidebar>
  );
}
