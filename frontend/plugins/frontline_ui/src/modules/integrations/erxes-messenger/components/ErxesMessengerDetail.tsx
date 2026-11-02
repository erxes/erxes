import { AddErxesMessengerSheet } from './AddErxesMessenger';
import type { IIntegration } from '@/integrations/types/Integration';
import { IntegrationEditButton } from '@/integrations/components/IntegrationPanelForm';

export const ErxesMessengerDetail = () => <AddErxesMessengerSheet />;

export const ErxesMessengerActions = ({
  integration,
}: {
  integration: IIntegration;
}) => <IntegrationEditButton integration={integration} />;
