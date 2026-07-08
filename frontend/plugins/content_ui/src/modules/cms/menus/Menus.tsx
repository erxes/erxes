import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, PageContainer, Kbd } from 'erxes-ui';
import { IconMenu, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { CmsSidebar } from '../shared/CmsSidebar';
import { HeaderLanguageTabs } from '../shared/HeaderLanguageTabs';
import { EmptyState } from '../shared/EmptyState';
import { MenuDrawer } from './MenuDrawer';
import { MenusHeader } from './components/MenusHeader';
import { MenusRecordTable } from './components/MenusRecordTable';
import { useMenus } from './hooks/useMenus';

export function Menus() {
  const { t } = useTranslation('content');
  const KIND_OPTIONS = [
    { label: t('all'), value: undefined },
    { label: t('header'), value: 'header' },
    { label: t('footer'), value: 'footer' },
  ];
  const { websiteId } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<any>(null);
  const [kindFilter, setKindFilter] = useState<string | undefined>(undefined);

  const { menus, totalCount, loading, refetch } = useMenus({
    clientPortalId: websiteId || '',
    kind: kindFilter,
  });

  const handleAddMenu = () => {
    setEditingMenu(null);
    setIsDrawerOpen(true);
  };

  const handleEditMenu = (menu: any) => {
    setEditingMenu(menu);
    setIsDrawerOpen(true);
  };

  const headerActions = (
    <div>
      <Button onClick={handleAddMenu}>
        <IconPlus />
        {t('add-menu')}
        <Kbd>M</Kbd>
      </Button>
    </div>
  );

  return (
    <PageContainer>
      <MenusHeader>
        <HeaderLanguageTabs />
        {headerActions}
      </MenusHeader>
      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />
        <div className="flex flex-col w-full overflow-hidden flex-auto">
          <div className="flex pt-2 pl-3 justify-between items-center mb-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-md border p-0.5 bg-muted">
                {KIND_OPTIONS.map((opt) => (
                  <Button
                    key={opt.label}
                    size="sm"
                    variant={kindFilter === opt.value ? 'default' : 'ghost'}
                    className="h-6 px-2 text-xs"
                    aria-pressed={kindFilter === opt.value}
                    onClick={() => setKindFilter(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {t('found-x-menus', { count: totalCount })}
              </span>
            </div>
          </div>

          {!loading && (!menus || menus.length === 0) ? (
            <div className="rounded-lg overflow-hidden">
              <EmptyState
                icon={IconMenu}
                title={t('no-menus-yet')}
                description={t('no-menus-yet-desc')}
                actionLabel={t('add-menu')}
                onAction={handleAddMenu}
              />
            </div>
          ) : (
            <div className="overflow-hidden flex-auto p-3">
              <div className="h-full">
                <MenusRecordTable
                  clientPortalId={websiteId || ''}
                  kind={kindFilter}
                  onEdit={handleEditMenu}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <MenuDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setEditingMenu(null);
        }}
        onSuccess={refetch}
        clientPortalId={websiteId || ''}
        menu={editingMenu}
      />
    </PageContainer>
  );
}
