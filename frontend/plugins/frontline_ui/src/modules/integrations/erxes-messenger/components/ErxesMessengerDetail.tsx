import { AddErxesMessengerSheet } from './AddErxesMessenger';
import type { IIntegration } from '@/integrations/types/Integration';
import { IntegrationEditButton } from '@/integrations/components/IntegrationPanelForm';

/** Shows the action for creating an erxes messenger integration. */
export const ErxesMessengerDetail = () => <AddErxesMessengerSheet />;

/** Opens the selected messenger integration in its record edit panel. */
export const ErxesMessengerActions = ({
  integration,
}: {
  integration: IIntegration;
}) => <IntegrationEditButton integration={integration} />;
