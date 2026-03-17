import { PageContainer, Spinner } from 'erxes-ui';
import { AddPageForm } from '~/modules/cms/pages/components/add-page-form';
import { PagesHeader } from '~/modules/cms/pages/components/PagesHeader';
import { AddPageHeaderActions } from '~/modules/cms/pages/components/add-page-form/AddPageHeaderActions';
import { useState, useCallback } from 'react';
import { usePageDetail } from '~/modules/cms/pages/hooks/usePageDetail';
import { useNavigate, useParams } from 'react-router-dom';
import { UseFormReturn } from 'react-hook-form';
import { PageFormData } from '~/modules/cms/pages/components/add-page-form/hooks/usePageForm';

interface IFormState {
  form: UseFormReturn<PageFormData>;
  onSubmit: (data?: PageFormData) => Promise<void>;
  creating: boolean;
  saving: boolean;
}

export const PagesDetailPage = ({
  clientPortalId,
  pageId,
}: {
  clientPortalId: string;
  pageId?: string;
}) => {
  const [formState, setFormState] = useState<IFormState | null>(null);
  const { page, loading } = usePageDetail(pageId ?? '');
  const navigate = useNavigate();
  const { websiteId } = useParams();

  const handleFormReady = useCallback((state: IFormState) => {
    setFormState(state);
  }, []);

  const handleClose = useCallback(() => {
    navigate(`/content/cms/${clientPortalId}/pages`);
  }, [navigate, clientPortalId]);

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
