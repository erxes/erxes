import { IntegrationEditButton } from '@/integrations/components/IntegrationPanelForm';
import { IIntegration } from '@/integrations/types/Integration';
import { CallProIntegrationAddSheet } from '@/integrations/callpro/components/CallProIntegrationAdd';

/** Shows the action for creating a Call Pro integration. */
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
