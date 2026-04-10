import { IconLayout, IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageContainer } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { CustomTypeDrawer } from '../components/customTypes/CustomTypeDrawer';
import { CmsSidebar } from '../shared/CmsSidebar';
import { EmptyState } from '../shared/EmptyState';
import { CustomTypesHeader } from './components/CustomTypesHeader';
import { CustomTypesRecordTable } from './components/CustomTypesRecordTable';
import { useCustomTypes } from './hooks/useCustomTypes';
import { useRemoveCustomType } from './hooks/useRemoveCustomType';
import { ICustomPostType } from './types/customTypeTypes';

export function CustomTypes() {
  const { websiteId } = useParams();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingType, setEditingType] = useState<any>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const { customTypes, loading } = useCustomTypes({
    clientPortalId: websiteId || '',
  });

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  const { removeBulkTypes } = useRemoveCustomType(refetch);

  useEffect(() => {}, [location]);

  const handleAddType = () => {
    setEditingType(null);
    setDrawerOpen(true);
  };

  const handleEditType = (customType: ICustomPostType) => {
    setEditingType(customType);
    setDrawerOpen(true);
  };

  const handleBulkDelete = async (ids: string[]) => {
    await removeBulkTypes(ids);
    refetch();
  };

  const headerActions = (
    <div>
      <Button onClick={handleAddType}>
        <IconPlus />
        Add Custom Type
        <Kbd>C</Kbd>
      </Button>
    </div>
  );

  return (
    <PageContainer>
      <CustomTypesHeader>{headerActions}</CustomTypesHeader>
      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <div className="flex-auto">
            <div className="flex flex-col">
              <div className="flex pt-2 pl-4 justify-between items-center mb-2">
                <div className="text-sm text-gray-600">
                  Found {customTypes?.length || 0} custom types
                </div>
              </div>
              {!loading && (!customTypes || customTypes.length === 0) ? (
                <div className="rounded-lg overflow-hidden">
                  <EmptyState
                    icon={IconLayout}
                    title="No custom types yet"
                    description="Create custom post types to organize your content."
                    actionLabel="Add Custom Type"
                    onAction={handleAddType}
                  />
                </div>
              ) : (
                <CustomTypesRecordTable
                  key={refetchTrigger}
                  clientPortalId={websiteId || ''}
                  onEdit={handleEditType}
                  onBulkDelete={handleBulkDelete}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <CustomTypeDrawer
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingType(null);
        }}
        clientPortalId={websiteId || ''}
        customType={editingType}
        onCreate={() => {
          refetch();
        }}
        onUpdate={() => {
          refetch();
          setEditingType(null);
        }}
      />
    </PageContainer>
  );
}
