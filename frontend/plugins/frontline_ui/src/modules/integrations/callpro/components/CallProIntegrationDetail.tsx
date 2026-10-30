import { IntegrationEditButton } from '@/integrations/components/IntegrationPanelForm';
import { IIntegration } from '@/integrations/types/Integration';
import { CallProIntegrationAddSheet } from '@/integrations/callpro/components/CallProIntegrationAdd';

export const CallProIntegrationDetail = () => {
  return (
    <div>
      <CallProIntegrationAddSheet />
    </div>
  );
};

export const CallProIntegrationActions = ({
  integration,
}: {
  integration: IIntegration;
}) => {
  return <IntegrationEditButton integration={integration} />;
};
