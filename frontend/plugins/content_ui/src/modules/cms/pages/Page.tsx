import { Button, PageContainer, Kbd } from 'erxes-ui';
import { IconArticle, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePages } from './hooks/usePages';
import { PageDrawer } from './PageDrawer';
import { PagesRecordTable } from './components/PagesRecordTable';
import { IPage } from './types/pageTypes';
import { EmptyState } from '../shared/EmptyState';
import { PagesHeader } from './components/PagesHeader';
import { PagesSidebar } from './components/PagesSidebar';

export function Page() {
  const { websiteId } = useParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPage, setSelectedPage] = useState<IPage | undefined>(
    undefined,
  );

  const { pages, totalCount, loading } = usePages({
    variables: {
      clientPortalId: websiteId || '',
    },
  });

  const headerActions = (
    <div>
      <Button onClick={() => setIsDrawerOpen(true)}>
        <IconPlus />
        Add Page
        <Kbd>C</Kbd>
      </Button>
    </div>
  );

  return (
    <PageContainer>
      <PagesHeader>{headerActions}</PagesHeader>
      <div className="flex overflow-hidden flex-auto">
        <PagesSidebar />
        <div className="flex overflow-hidden flex-col flex-auto w-full">
          <div className="flex-auto">
            <div className="flex flex-col">
              <div className="flex pt-2 pl-4 justify-between items-center mb-2">
                <div className="text-sm text-gray-600">
                  Found {totalCount} pages
                </div>
              </div>
              {!loading && (!pages || pages.length === 0) ? (
                <div className="rounded-lg overflow-hidden">
                  <EmptyState
                    icon={IconArticle}
                    title="No pages yet"
                    description="Get started by creating your first page."
                    actionLabel="Add page"
                    onAction={() => setIsDrawerOpen(true)}
                  />
                </div>
              ) : (
                <PagesRecordTable
                  clientPortalId={websiteId || ''}
                  onEditPage={(page) => {
                    setSelectedPage(page);
                    setIsDrawerOpen(true);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <PageDrawer
        page={selectedPage}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedPage(undefined);
        }}
        clientPortalId={websiteId || ''}
      />
    </PageContainer>
  );
}
