import { TemplatesHeader } from '@/template/components/TemplatesHeader';
import {
  TemplateError,
  TemplateLoading,
} from '@/template/components/TemplateStateViews';
import { TemplateWizard } from '@/template/components/wizard/TemplateWizard';
import { useTemplateDetail } from '@/template/hooks/useTemplates';
import { PageContainer } from 'erxes-ui';
import { useParams } from 'react-router';

export const TemplateInstallPage = () => {
  const { pluginName, id } = useParams<{ pluginName: string; id: string }>();
  const { template, loading, error } = useTemplateDetail(pluginName, id);

  return (
    <PageContainer>
      <TemplatesHeader current={template?.name} />
      {loading && <TemplateLoading />}
      {error && <TemplateError message={error.message} />}
      {template && <TemplateWizard template={template} />}
    </PageContainer>
  );
};
