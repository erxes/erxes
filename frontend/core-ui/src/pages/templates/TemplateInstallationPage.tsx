import { TemplateInstallationDetail } from '@/template/components/installation/TemplateInstallationDetail';
import { TemplatesHeader } from '@/template/components/TemplatesHeader';
import {
  TemplateError,
  TemplateLoading,
} from '@/template/components/TemplateStateViews';
import { useTemplateInstallationDetail } from '@/template/hooks/useTemplateInstallations';
import { PageContainer } from 'erxes-ui';
import { useParams } from 'react-router';

export const TemplateInstallationPage = () => {
  const { id } = useParams<{ id: string }>();
  const { installation, loading, error } = useTemplateInstallationDetail(id);

  return (
    <PageContainer>
      <TemplatesHeader current={installation?.name} />
      {loading && !installation && <TemplateLoading />}
      {error && <TemplateError message={error.message} />}
      {installation && <TemplateInstallationDetail installation={installation} />}
    </PageContainer>
  );
};
