import { IconPlus, IconTags } from '@tabler/icons-react';
import { Button, Kbd, PageContainer } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useTags } from '../hooks/useTags';
import { CmsSidebar } from '../shared/CmsSidebar';
import { EmptyState } from '../shared/EmptyState';
import { HeaderLanguageTabs } from '../shared/HeaderLanguageTabs';
import { TagsHeader } from './components/TagsHeader';
import { TagsRecordTable } from './components/TagsRecordTable';
import { useRemoveTag } from './hooks/useRemoveTag';
import { TagDrawer } from './TagDrawer';
import { CmsTag } from './types/tagTypes';

export function Tag() {
  const { t } = useTranslation('content');
  const { websiteId } = useParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<CmsTag | undefined>(undefined);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const { tags, totalCount, loading } = useTags({
    clientPortalId: websiteId || '',
  });
  const { removeTag } = useRemoveTag();

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  const handleAddTag = () => {
    setSelectedTag(undefined);
    setDrawerOpen(true);
  };

  const handleEditTag = (tag: CmsTag) => {
    setSelectedTag(tag);
    setDrawerOpen(true);
  };

  const handleBulkDelete = async (ids: string[]) => {
    await removeTag(ids);
    refetch();
  };

  const headerActions = (
    <div>
      <Button onClick={handleAddTag}>
        <IconPlus />
        {t('add-tag')}
        <Kbd>T</Kbd>
      </Button>
    </div>
  );

  return (
    <PageContainer>
      <TagsHeader>
        <HeaderLanguageTabs />
        {headerActions}
      </TagsHeader>
      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />
        <div className="flex flex-col w-full overflow-hidden flex-auto">
          <div className="flex pt-2 pl-4 justify-between items-center mb-2">
            <div className="text-sm text-gray-600">
              {t('found-x-tags', { count: totalCount })}
            </div>
          </div>
          {!loading && (!tags || tags.length === 0) ? (
            <div className="rounded-lg overflow-hidden">
              <EmptyState
                icon={IconTags}
                title={t('no-tags-yet')}
                description={t('no-tags-yet-desc')}
                actionLabel={t('add-tag')}
                onAction={handleAddTag}
              />
            </div>
          ) : (
            <div className="overflow-hidden flex-auto p-3">
              <div className="h-full">
                <TagsRecordTable
                  key={refetchTrigger}
                  clientPortalId={websiteId || ''}
                  onEdit={handleEditTag}
                  onBulkDelete={handleBulkDelete}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <TagDrawer
        tag={selectedTag}
        isOpen={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTag(undefined);
        }}
        clientPortalId={websiteId || ''}
      />
    </PageContainer>
  );
}
