import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, PageContainer, Kbd } from 'erxes-ui';
import { IconMenu, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { MenuDrawer } from '@/cms/menus/components/MenuDrawer';
import { MenusHeader } from '@/cms/menus/components/MenusHeader';
import { MenusRecordTable } from '@/cms/menus/components/MenusRecordTable';
import { useMenus } from '@/cms/menus/hooks/useMenus';
import { MenuItem, MenuRecord } from '@/cms/menus/types/menuDrawerTypes';
import { CmsSidebar } from '@/cms/shared/CmsSidebar';
import { EmptyState } from '@/cms/shared/EmptyState';
import { HeaderLanguageTabs } from '@/cms/shared/HeaderLanguageTabs';

export function MenusPage() {
  const { t } = useTranslation('content');
  const kindOptions = [
    { label: t('all'), value: undefined },
    { label: t('header'), value: 'header' },
    { label: t('footer'), value: 'footer' },
  ] as const;
  const { websiteId } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuRecord>();
  const [kindFilter, setKindFilter] = useState<string | undefined>(undefined);

  const { menus, totalCount, loading, refetch } = useMenus({
    clientPortalId: websiteId || '',
    kind: kindFilter,
  });

  const handleAddMenu = () => {
    setEditingMenu(undefined);
    setIsDrawerOpen(true);
  };

  const handleEditMenu = (menu: MenuItem) => {
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
                {kindOptions.map((opt) => (
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
          setEditingMenu(undefined);
        }}
        onSuccess={refetch}
        clientPortalId={websiteId || ''}
        menu={editingMenu}
      />
    </PageContainer>
  );
}
