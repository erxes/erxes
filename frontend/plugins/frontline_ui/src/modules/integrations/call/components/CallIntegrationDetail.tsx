import { IntegrationEditButton } from '@/integrations/components/IntegrationPanelForm';
import { IIntegration } from '@/integrations/types/Integration';
import { Switch, Tooltip } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CallIntegrationAddSheet } from '@/integrations/call/components/CallIntegrationAdd';
import { useCallUserIntegration } from '@/integrations/call/hooks/useCallUserIntegration';
import { useCallEnabledIntegrations } from '@/integrations/call/hooks/useCallEnabledIntegrations';

/** Shows the action for creating a call integration. */
export const CallIntegrationDetail = () => {
  return (
    <div>
      <CallIntegrationAddSheet />
    </div>
  );
};

/** Toggles the selected call integration for the signed-in user's dialer. */
export const CallIntegrationConnect = ({
  integrationId,
}: {
  integrationId: string;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { callUserIntegrations } = useCallUserIntegration();
  const { isEnabled, toggleIntegration } = useCallEnabledIntegrations();

  const integration = callUserIntegrations?.find(
    (integration) => integration.inboxId === integrationId,
  );

  if (!integration) {
    return null;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Switch
            onClick={(event) => event.stopPropagation()}
            checked={isEnabled(integrationId)}
            onCheckedChange={(checked) =>
              toggleIntegration(integration, checked)
            }
          />
        </Tooltip.Trigger>
        <Tooltip.Content>{t('connect-to-call')}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

/** Exposes the call connection toggle beside the shared integration editor. */
export const CallIntegrationActions = ({
  integration,
}: {
  integration: IIntegration;
}) => {
  return (
    <>
      <CallIntegrationConnect integrationId={integration._id} />
      <IntegrationEditButton integration={integration} />
    </>
  );
};
