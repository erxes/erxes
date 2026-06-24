import { IconPlus, IconTags } from '@tabler/icons-react';
import { Button, Kbd, PageContainer, useFilterQueryState } from 'erxes-ui';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTags } from '../hooks/useTags';
import { CmsSidebar } from '../shared/CmsSidebar';
import { EmptyState } from '../shared/EmptyState';
import { HeaderLanguageTabs } from '../shared/HeaderLanguageTabs';
import { TagsHeader } from './components/TagsHeader';
import { TagsFilter } from './components/TagsFilter';
import { TagsRecordTable } from './components/TagsRecordTable';
import { useRemoveTag } from './hooks/useRemoveTag';
import { TagDrawer } from './TagDrawer';
import { CmsTag } from './types/tagTypes';

export function Tag() {
  const { websiteId } = useParams();
  const [searchValue] = useFilterQueryState<string>('searchValue');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<CmsTag | undefined>(undefined);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const { tags, loading } = useTags({
    clientPortalId: websiteId || '',
    searchValue: searchValue || undefined,
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
        Add Tag
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
          <div className="px-4 pt-2">
            <TagsFilter />
          </div>
          {!loading && (!tags || tags.length === 0) ? (
            <div className="rounded-lg overflow-hidden">
              <EmptyState
                icon={IconTags}
                title="No tags yet"
                description="Get started by creating your first tag."
                actionLabel="Add tag"
                onAction={handleAddTag}
              />
            </div>
          ) : (
            <div className="overflow-hidden flex-auto p-3">
              <div className="h-full">
                <TagsRecordTable
                  key={refetchTrigger}
                  clientPortalId={websiteId || ''}
                  searchValue={searchValue || undefined}
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
