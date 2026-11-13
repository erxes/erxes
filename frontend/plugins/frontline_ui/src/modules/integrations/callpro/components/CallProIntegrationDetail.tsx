import { IntegrationEditButton } from '@/integrations/components/IntegrationPanelForm';
import { IIntegration } from '@/integrations/types/Integration';
import { CallProIntegrationAddSheet } from '@/integrations/callpro/components/CallProIntegrationAdd';

/** Opens the Call Pro integration creation panel. */
export const CallProIntegrationDetail = () => {
  return (
    <div>
      <CallProIntegrationAddSheet />
    </div>
  );
};

/** Opens the selected Call Pro integration in the edit panel. */
export const CallProIntegrationActions = ({
  integration,
}: {
  integration: IIntegration;
}) => {
  return <IntegrationEditButton integration={integration} />;
};
