import { IntegrationType } from '@/types/Integration';
import { AddErxesMessengerPanelForm } from '@/integrations/erxes-messenger/components/AddErxesMessenger';
import { EditErxesMessengerSheet } from '@/integrations/erxes-messenger/components/EditErxesMessengerSheet';
import { CallIntegrationAdd } from '@/integrations/call/components/CallIntegrationAdd';
import { CallIntegrationSheetEdit } from '@/integrations/call/components/CallIntegrationEdit';
import { CallProIntegrationAdd } from '@/integrations/callpro/components/CallProIntegrationAdd';
import { CallProIntegrationSheetEdit } from '@/integrations/callpro/components/CallProIntegrationEdit';
import { FacebookIntegrationPanelForm } from '@/integrations/facebook/components/FacebookIntegrationForm';
import { FacebookIntegrationEditForm } from '@/integrations/facebook/components/FacebookIntegrationDetail';
import { InstagramIntegrationPanelForm } from '@/integrations/instagram/components/InstagramIntegrationForm';
import { InstagramIntegrationEditForm } from '@/integrations/instagram/components/InstagramIntegrationDetail';
import { MailIntegrationPanelForm } from '@/integrations/mail/components/MailIntegrationForm';
import { MailIntegrationEditForm } from '@/integrations/mail/components/MailIntegrationDetail';
import { DiscordIntegrationPanelForm } from '@/integrations/discord/components/DiscordIntegrationDetail';
import { DiscordIntegrationEditForm } from '@/integrations/discord/components/DiscordIntegrationActions';
import { TelegramSetup } from '@/integrations/telegram/TelegramIntegrationDetail';
import { Empty, Sheet } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel } from 'ui-modules';

/** Selects the provider's create or edit form for the integration record. */
const IntegrationForm = ({ kind, id }: { kind: string; id?: string }) => {
  const { close } = useSidePanel();
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  /** Closes the side panel when a provider form requests dismissal. */
  const setOpen = (open: boolean) => !open && close();

  switch (kind) {
    case IntegrationType.ERXES_MESSENGER:
      return id ? (
        <EditErxesMessengerSheet id={id} />
      ) : (
        <AddErxesMessengerPanelForm />
      );
    case IntegrationType.CALL:
      return id ? <CallIntegrationSheetEdit id={id} /> : <CallIntegrationAdd />;
    case IntegrationType.CALLPRO:
      return id ? (
        <CallProIntegrationSheetEdit id={id} />
      ) : (
        <CallProIntegrationAdd />
      );
    case IntegrationType.FACEBOOK_MESSENGER:
    case IntegrationType.FACEBOOK_POST:
      return id ? (
        <FacebookIntegrationEditForm id={id} setOpen={setOpen} />
      ) : (
        <FacebookIntegrationPanelForm
          isPost={kind === IntegrationType.FACEBOOK_POST}
        />
      );
    case IntegrationType.INSTAGRAM_MESSENGER:
    case IntegrationType.INSTAGRAM_POST:
      return id ? (
        <InstagramIntegrationEditForm id={id} setOpen={setOpen} />
      ) : (
        <InstagramIntegrationPanelForm
          isPost={kind === IntegrationType.INSTAGRAM_POST}
        />
      );
    case IntegrationType.MAIL:
      return id ? (
        <MailIntegrationEditForm id={id} setOpen={setOpen} />
      ) : (
        <MailIntegrationPanelForm />
      );
    case IntegrationType.DISCORD_MESSENGER:
      return id ? (
        <DiscordIntegrationEditForm id={id} setOpen={setOpen} />
      ) : (
        <DiscordIntegrationPanelForm />
      );
    case IntegrationType.TELEGRAM_MESSENGER:
      return <TelegramSetup integrationId={id ?? null} />;
    default:
      return (
        <Empty>
          <Empty.Header>
            <Empty.Title>
              {t('integration-not-found', 'Integration unavailable')}
            </Empty.Title>
          </Empty.Header>
        </Empty>
      );
  }
};

/** Hosts provider forms in the shared sheet context within the record panel. */
export const IntegrationRecordForm = (props: { kind: string; id?: string }) => {
  const { close } = useSidePanel();
  return (
    <Sheet open onOpenChange={(open) => !open && close()}>
      <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
        <IntegrationForm {...props} />
      </div>
    </Sheet>
  );
};
