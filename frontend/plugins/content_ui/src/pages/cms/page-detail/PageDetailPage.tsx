import { PageContainer, Spinner } from 'erxes-ui';
import { PageDrawer } from '~/modules/cms/pages/PageDrawer';
import { PagesHeader } from '~/modules/cms/pages/components/PagesHeader';
import { usePageDetail } from '~/modules/cms/pages/hooks/usePageDetail';
import { useNavigate, useParams } from 'react-router-dom';

export const PagesDetailPage = ({
  clientPortalId,
  pageId,
}: {
  clientPortalId: string;
  pageId?: string;
}) => {
  const isEditing = Boolean(pageId);

  const { page, loading } = usePageDetail(pageId ?? '');
  const navigate = useNavigate();
  const { websiteId } = useParams();

  const handleClose = () => {
    navigate(`/content/cms/${websiteId}/pages`);
  };

  return (
    <PageContainer key={pageId}>
      <PagesHeader>{/* add action if needed */}</PagesHeader>
      <div className="flex flex-col overflow-hidden w-full h-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner />
          </div>
        ) : (
          clientPortalId && (
            <PageDrawer
              page={isEditing ? page : undefined}
              onClose={handleClose}
              clientPortalId={clientPortalId}
            />
          )
        )}
      </div>
    </PageContainer>
  );
};
