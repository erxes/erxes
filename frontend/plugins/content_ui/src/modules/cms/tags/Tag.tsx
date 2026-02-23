import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TagsRecordTable } from './components/TagsRecordTable';
import { TagsHeader } from './components/TagsHeader';
import { TagDrawer } from './TagDrawer';
import { useRemoveTag } from './hooks/useRemoveTag';
import { CmsTag } from './types/tagTypes';
import { TagsSidebar } from './components/TagsSidebar';
import { PageContainer } from 'erxes-ui';
import { EmptyState } from '../shared/EmptyState';
import { IconTags } from '@tabler/icons-react';
import { useTags } from '../hooks/useTags';
import { Button, Kbd } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';

export function Tag() {
  const { websiteId } = useParams();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<CmsTag | undefined>(undefined);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const { tags, loading } = useTags({
    clientPortalId: websiteId || '',
  });
  const { removeTag } = useRemoveTag();

  useEffect(() => {}, [location]);

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
      <TagsHeader>{headerActions}</TagsHeader>
      <div className="flex overflow-hidden flex-auto">
        <TagsSidebar />
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <div className="flex-auto">
            <div className="flex flex-col">
              <div className="flex pt-2 pl-4 justify-between items-center mb-2">
                <div className="text-sm text-gray-600">
                  Found {tags?.length || 0} tags
                </div>
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
                <TagsRecordTable
                  key={refetchTrigger}
                  clientPortalId={websiteId || ''}
                  onEdit={handleEditTag}
                  onBulkDelete={handleBulkDelete}
                />
              )}
            </div>
          </div>
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
