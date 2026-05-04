import { AutomationBuilder } from '@/automations/components/builder/AutomationBuilder';
import { AUTOMATION_DETAIL } from '@/automations/graphql/automationQueries';
import { IAutomation } from '@/automations/types';
import { useQuery } from '@apollo/client';
import { PageContainer, Spinner } from 'erxes-ui';
import { useParams } from 'react-router';
export const AutomationDetailPage = () => {
  const { id } = useParams();

  const { data, loading } = useQuery<{
    automationDetail: IAutomation;
  }>(AUTOMATION_DETAIL, {
    variables: { id },
    skip: !id,
  });

  if (loading) {
    return <Spinner />;
  }

  const detail = data?.automationDetail;

  return (
    <PageContainer>
      <AutomationBuilder detail={detail} />
    </PageContainer>
  );
};
