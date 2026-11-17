import { TemplatesGallery } from '@/template/components/TemplatesGallery';
import { TemplatesHeader } from '@/template/components/TemplatesHeader';
import { useLegacyInstalledTab } from '@/template/hooks/useLegacyInstalledTab';
import { PageContainer } from 'erxes-ui';
import { Navigate } from 'react-router';

export const TemplatesIndexPage = () => {
  const { redirectTo } = useLegacyInstalledTab();

  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <PageContainer>
      <TemplatesHeader />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <TemplatesGallery />
      </div>
    </PageContainer>
  );
};
