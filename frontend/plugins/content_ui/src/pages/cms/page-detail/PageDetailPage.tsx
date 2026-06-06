import { PageContainer, Spinner } from 'erxes-ui';
import { PageDrawer } from '~/modules/cms/pages/PageDrawer';
import { PagesHeader } from '~/modules/cms/pages/components/PagesHeader';
import { PageHeaderActions } from '~/modules/cms/pages/components/PageHeaderActions';
import { usePageDetail } from '~/modules/cms/pages/hooks/usePageDetail';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useCallback, useRef } from 'react';
import {
  type PageDetailFormState,
  type PagesDetailPageProps,
} from '~/modules/cms/pages/types/pageTypes';

export const PagesDetailPage = ({
  clientPortalId,
  pageId,
}: PagesDetailPageProps) => {
  const [formState, setFormState] = useState<PageDetailFormState | null>(null);
  const isEditing = Boolean(pageId);
  const { page, loading } = usePageDetail(pageId ?? '');
  const navigate = useNavigate();
  const { websiteId } = useParams();

  const languageChangeRef = useRef<(lang: string) => void>();

  const handleFormReady = useCallback((state: PageDetailFormState) => {
    setFormState(state);
    languageChangeRef.current = state.handleLanguageChange;
  }, []);

  const handleHeaderLanguageChange = useCallback((lang: string) => {
    if (languageChangeRef.current) {
      languageChangeRef.current(lang);
    }
  }, []);

  const handleClose = useCallback(() => {
    navigate(`/content/cms/${websiteId}/pages`);
  }, [navigate, websiteId]);

  return (
    <PageContainer key={pageId}>
      <PagesHeader onLanguageChange={handleHeaderLanguageChange}>
        {formState && (
          <PageHeaderActions
            form={formState.form}
            onSubmit={formState.onSubmit}
            getSaving={formState.getSaving}
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
