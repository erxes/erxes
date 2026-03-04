import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, PageContainer, Kbd } from 'erxes-ui';
import { IconMenu, IconPlus } from '@tabler/icons-react';
import { CmsSidebar } from '../shared/CmsSidebar';
import { EmptyState } from '../shared/EmptyState';
import { MenuDrawer } from './MenuDrawer';
import { MenusHeader } from './components/MenusHeader';
import { MenusRecordTable } from './components/MenusRecordTable';
import { useMenus } from './hooks/useMenus';

const KIND_OPTIONS = [
  { label: 'All', value: undefined },
  { label: 'Header', value: 'header' },
  { label: 'Footer', value: 'footer' },
] as const;

export function Menus() {
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
        Add Menu
        <Kbd>M</Kbd>
      </Button>
    </div>
  );

  return (
    <PageContainer>
      <MenusHeader>{headerActions}</MenusHeader>
      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <div className="flex-auto">
            <div className="flex flex-col">
              <div className="flex pt-2 pl-3 justify-between items-center mb-0">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-md border p-0.5 bg-muted">
                    {KIND_OPTIONS.map((opt) => (
                      <Button
                        key={opt.label}
                        size="sm"
                        variant={kindFilter === opt.value ? 'default' : 'ghost'}
                        className="h-6 px-2 text-xs"
                        onClick={() => setKindFilter(opt.value)}
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    Found {totalCount} menus
                  </span>
                </div>
              </div>

              {!loading && (!menus || menus.length === 0) ? (
                <div className="rounded-lg overflow-hidden">
                  <EmptyState
                    icon={IconMenu}
                    title="No menus yet"
                    description="Get started by creating your first menu."
                    actionLabel="Add menu"
                    onAction={handleAddMenu}
                  />
                </div>
              ) : (
                <MenusRecordTable
                  clientPortalId={websiteId || ''}
                  kind={kindFilter}
                  onEdit={handleEditMenu}
                />
              )}
            </div>
          </div>
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
