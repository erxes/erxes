import { useAutomation } from '@/automations/context/AutomationProvider';
import { GET_AUTOMATION_WEBHOOK_ENDPOINT } from '@/automations/graphql/automationQueries';
import { useQuery } from '@apollo/client';
import { useParams } from 'react-router';

type QueryResponse = {
  getAutomationWebhookEndpoint: string;
};

const PLACEHOLDER_ENDPOINT_CREATE_PAGE = 'your-endpoint';

export const useAutomationWebhookEndpoint = () => {
  const { id } = useParams();
  const { isCreatePage } = useAutomation();

  const { data, loading } = useQuery<QueryResponse>(
    GET_AUTOMATION_WEBHOOK_ENDPOINT,
    { variables: { id } },
  );

  return {
    endpoint: isCreatePage
      ? PLACEHOLDER_ENDPOINT_CREATE_PAGE
      : data?.getAutomationWebhookEndpoint,
    loading,
  };
};
