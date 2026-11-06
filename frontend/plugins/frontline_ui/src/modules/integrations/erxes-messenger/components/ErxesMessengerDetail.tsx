import { AddErxesMessengerSheet } from './AddErxesMessenger';
import type { IIntegration } from '@/integrations/types/Integration';
import { IntegrationEditButton } from '@/integrations/components/IntegrationPanelForm';

/** Opens the messenger integration creation panel. */
export const ErxesMessengerDetail = () => <AddErxesMessengerSheet />;

/** Opens the selected messenger integration for editing. */
export const ErxesMessengerActions = ({
  integration,
}: {
  integration: IIntegration;
}) => <IntegrationEditButton integration={integration} />;
