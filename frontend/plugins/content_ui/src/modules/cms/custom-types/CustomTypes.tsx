import { IconLayout, IconPlus } from '@tabler/icons-react';
import { Button, Kbd, PageContainer } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { EmptyState } from '../shared/EmptyState';
import { CustomTypesHeader } from './components/CustomTypesHeader';
import { CustomTypesRecordTable } from './components/CustomTypesRecordTable';
import { useCustomTypes } from './hooks/useCustomTypes';
import { useRemoveCustomType } from './hooks/useRemoveCustomType';
import { ICustomPostType } from './types/customTypeTypes';
import { CMS_CUSTOM_TYPE_CONTENT_TYPE } from '@/cms/shared/side-panel/contentPanelTypes';
import { useContentPanel } from '@/cms/shared/side-panel/useContentPanel';

export function CustomTypes() {
  const { t } = useTranslation('content');
  const { websiteId } = useParams();
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const { customTypes, loading } = useCustomTypes({
    clientPortalId: websiteId || '',
  });

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  const { removeBulkTypes } = useRemoveCustomType(refetch);

  const { openDraft, openDetail } = useContentPanel(
    CMS_CUSTOM_TYPE_CONTENT_TYPE,
  );

  const handleAddType = () => {
    openDraft({ clientPortalId: websiteId });
  };

  const handleEditType = (customType: ICustomPostType) => {
    openDetail(customType._id);
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
    <PageContainer className="flex-row">
      <div className="flex min-w-0 flex-auto flex-col overflow-hidden">
        <CustomTypesHeader>{headerActions}</CustomTypesHeader>
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <div className="flex-auto">
            <div className="flex flex-col">
              <div className="flex pt-2 pl-4 justify-between items-center mb-2">
                <div className="text-sm text-gray-600">
                  {t('found-x-custom-types', {
                    count: customTypes?.length || 0,
                  })}
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
    </PageContainer>
  );
}
