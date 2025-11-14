import { useLazyQuery } from '@apollo/client';
import { AUTOMATION_EMAIL_TEMPLATE_DETAIL } from '@/automations/components/settings/components/email-templates/graphql/queries';
import { IAutomationEmailTemplate } from '@/automations/components/settings/components/email-templates/types/automationEmailTemplates';

export function useAutomationEmailTemplateDetailLazy() {
  const [loadTemplate, { data, loading, error }] = useLazyQuery<{
    automationEmailTemplateDetail: IAutomationEmailTemplate;
  }>(AUTOMATION_EMAIL_TEMPLATE_DETAIL, {
    fetchPolicy: 'cache-and-network',
  });

  const loadEmailTemplate = (id: string) => {
    return loadTemplate({
      variables: { id },
    });
  };

  return {
    loadEmailTemplate,
    emailTemplate: data?.automationEmailTemplateDetail,
    loading,
    error,
  };
}
