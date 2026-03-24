import { useQuery } from '@apollo/client';
import { AUTOMATION_EMAIL_TEMPLATE_DETAIL } from '@/automations/components/settings/components/email-templates/graphql/queries';
import { IAutomationEmailTemplate } from '@/automations/components/settings/components/email-templates/types/automationEmailTemplates';

export function useAutomationEmailTemplateDetail(id: string) {
  const { data, loading, error, refetch } = useQuery<{
    automationEmailTemplateDetail: IAutomationEmailTemplate;
  }>(AUTOMATION_EMAIL_TEMPLATE_DETAIL, {
    variables: { id },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  return {
    emailTemplate: data?.automationEmailTemplateDetail,
    loading,
    error,
    refetch,
  };
}
