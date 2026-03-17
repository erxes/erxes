import { PageContainer, Spinner } from 'erxes-ui';
import { AddPageForm } from '~/modules/cms/pages/components/add-page-form';
import { PagesHeader } from '~/modules/cms/pages/components/PagesHeader';
import { AddPageHeaderActions } from '~/modules/cms/pages/components/add-page-form/AddPageHeaderActions';
import { useState, useCallback } from 'react';
import { usePageDetail } from '~/modules/cms/pages/hooks/usePageDetail';
import { useNavigate, useParams } from 'react-router-dom';

export const PagesDetailPage = ({
  clientPortalId,
  pageId,
}: {
  clientPortalId: string;
  pageId?: string;
}) => {
  const [formState, setFormState] = useState<any>(null);
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
          <AddPageHeaderActions
            form={formState.form}
            onSubmit={formState.onSubmit}
            creating={formState.creating}
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
            <AddPageForm
              websiteId={clientPortalId}
              editingPage={pageId ? page : undefined}
              onFormReady={handleFormReady}
              onClose={handleClose}
            />
          )
        )}
      </div>
    </PageContainer>
  );
};
