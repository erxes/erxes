import { Button, Collapsible, getPluginAssetsUrl } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IntegrationLogo } from '@/integrations/components/IntegrationLogo';
import { INTEGRATIONS } from '@/integrations/constants/integrations';
import { IntegrationType } from '@/types/Integration';
import { useTelegramTranslation } from './translations';

export const TelegramConfigCollapse = () => {
  const { t } = useTelegramTranslation();
  const integration = INTEGRATIONS[IntegrationType.TELEGRAM_MESSENGER];

  return (
    <Collapsible className="w-full bg-muted rounded-lg">
      <Collapsible.Trigger asChild>
        <Button
          variant="secondary"
          className="w-full h-auto flex justify-start group bg-transparent hover:bg-transparent gap-3 px-3 font-semibold"
        >
          <Collapsible.TriggerIcon className="text-accent-foreground" />
          <IntegrationLogo
            img={getPluginAssetsUrl('frontline', integration.img)}
            name={integration.name}
          />
          {t('title')}
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content className="shadow-xs rounded-lg p-3 bg-background">
        <div className="flex flex-col gap-4 text-sm">
          <p>{t('configIntro')}</p>
          <ol className="list-decimal pl-5 space-y-2 text-muted-foreground">
            <li>{t('configChooseInbox')}</li>
            <li>{t('configConnect')}</li>
            <li>{t('configManage')}</li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/settings/frontline/personal-channel">
                {t('personalInbox')}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/settings/frontline/channels">{t('teamInboxes')}</Link>
            </Button>
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
};
