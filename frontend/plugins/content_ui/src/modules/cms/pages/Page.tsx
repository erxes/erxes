import { Button, PageContainer, Kbd } from 'erxes-ui';
import { IconArticle, IconPlus } from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePages } from './hooks/usePages';
import { PagesRecordTable } from './components/PagesRecordTable';
import { IPage } from './types/pageTypes';
import { EmptyState } from '../shared/EmptyState';
import { PagesHeader } from './components/PagesHeader';
import { CmsSidebar } from '../shared/CmsSidebar';

export function Page() {
  const { websiteId } = useParams();
  const navigate = useNavigate();

  const { pages, totalCount, loading } = usePages({
    variables: {
      clientPortalId: websiteId || '',
    },
  });

  const headerActions = (
    <div>
      <Button
        onClick={() => navigate(`/content/cms/${websiteId}/pages/detail`)}
      >
        <IconPlus />
        Add Page
        <Kbd>C</Kbd>
      </Button>
    </div>
  );

  const handleEditPage = (page: IPage) => {
    navigate(`/content/cms/${page.clientPortalId}/pages/detail/${page._id}`);
  };

  return (
    <PageContainer>
      <PagesHeader>
        {headerActions}
      </PagesHeader>
      <div className="flex overflow-hidden flex-auto">
        <CmsSidebar />
        <div className="flex flex-col w-full overflow-hidden flex-auto">
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
                onAction={() =>
                  navigate(`/content/cms/${websiteId}/pages/detail`)
                }
              />
            </div>
          ) : (
            <div className="overflow-hidden flex-auto p-3">
              <div className="h-full">
                <PagesRecordTable
                  clientPortalId={websiteId || ''}
                  onEditPage={handleEditPage}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
