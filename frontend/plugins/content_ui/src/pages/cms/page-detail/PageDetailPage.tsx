import { PageContainer, Spinner } from 'erxes-ui';
import { PageDrawer } from '~/modules/cms/pages/PageDrawer';
import { PagesHeader } from '~/modules/cms/pages/components/PagesHeader';
import { PageHeaderActions } from '~/modules/cms/pages/components/PageHeaderActions';
import { usePageDetail } from '~/modules/cms/pages/hooks/usePageDetail';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useCallback } from 'react';

export const PagesDetailPage = ({
  clientPortalId,
  pageId,
}: {
  clientPortalId: string;
  pageId?: string;
}) => {
  const [formState, setFormState] = useState<any>(null);
  const isEditing = Boolean(pageId);
  const { page, loading } = usePageDetail(pageId ?? '');
  const navigate = useNavigate();
  const { websiteId } = useParams();

  const handleFormReady = useCallback((state: any) => {
    setFormState(state);
  }, []);

  const handleClose = useCallback(() => {
    navigate(`/content/cms/${websiteId}/pages`);
  }, [navigate, websiteId]);

  return (
    <PageContainer key={pageId}>
      <PagesHeader>
        {formState && (
          <PageHeaderActions
            form={formState.form}
            onSubmit={formState.onSubmit}
            saving={formState.saving}
          />
        )}
      </PagesHeader>
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
              onFormReady={handleFormReady}
            />
          )
        )}
      </div>
    </PageContainer>
  );
};
