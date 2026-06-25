import { IconLayout, IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageContainer } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { CustomTypeDrawer } from '@/cms/custom-types/components/CustomTypeDrawer';
import { CustomTypesHeader } from '@/cms/custom-types/components/CustomTypesHeader';
import { CustomTypesRecordTable } from '@/cms/custom-types/components/CustomTypesRecordTable';
import { useCustomTypes } from '@/cms/custom-types/hooks/useCustomTypes';
import { useRemoveCustomType } from '@/cms/custom-types/hooks/useRemoveCustomType';
import { ICustomPostType } from '@/cms/custom-types/types/customTypeTypes';
import { CmsSidebar } from '@/cms/shared/CmsSidebar';
import { EmptyState } from '@/cms/shared/EmptyState';

export function CustomTypesPage() {
  const { t } = useTranslation('content');
  const { websiteId } = useParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingType, setEditingType] = useState<ICustomPostType>();
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const { customTypes, loading } = useCustomTypes({
    clientPortalId: websiteId || '',
  });

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  const { removeBulkTypes } = useRemoveCustomType(refetch);

  const handleAddType = () => {
    setEditingType(undefined);
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
        {t('add-custom-type')}
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
                  {t('found-x-custom-types', { count: customTypes?.length || 0 })}
                </div>
              </div>
              {!loading && (!customTypes || customTypes.length === 0) ? (
                <div className="rounded-lg overflow-hidden">
                  <EmptyState
                    icon={IconLayout}
                    title={t('no-custom-types-yet')}
                    description={t('no-custom-types-yet-desc')}
                    actionLabel={t('add-custom-type')}
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
          setEditingType(undefined);
        }}
        clientPortalId={websiteId || ''}
        customType={editingType}
        onCreate={() => {
          refetch();
        }}
        onUpdate={() => {
          refetch();
          setEditingType(undefined);
        }}
      />
    </PageContainer>
  );
}
