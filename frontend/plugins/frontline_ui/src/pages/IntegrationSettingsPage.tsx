import { IntegrationList } from '@/integrations/components/IntegrationList';
import { ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const IntegrationSettingsPage = () => {
  const { t } = useTranslation('frontline');
  return (
    <ScrollArea>
      <div className="h-full w-full mx-auto max-w-3xl px-8 py-5 flex flex-col gap-8">
        <div className="flex flex-col gap-2 px-1">
          <h1 className="text-lg font-semibold">{t('integrations')}</h1>
          <span className="font-normal text-muted-foreground text-sm">
            {t('integrations-subtitle')}
          </span>
        </div>
        <IntegrationList />
      </div>
    </ScrollArea>
  );
};
