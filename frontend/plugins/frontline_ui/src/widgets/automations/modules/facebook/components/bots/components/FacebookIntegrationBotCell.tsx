import { IconPlus } from '@tabler/icons-react';
import { Button, RecordTableInlineCell, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { FacebookBotSheet } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotSheet';
import { FacebookBotSummary } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotSummary';
import { useFacebookIntegrationBot } from '~/widgets/automations/modules/facebook/components/bots/hooks/useFacebookIntegrationBot';

export const FacebookIntegrationBotCell = ({
  integrationId,
}: {
  integrationId: string;
}) => {
  const { t } = useTranslation('frontline');
  const { loading, page, bot } = useFacebookIntegrationBot(integrationId);

  if (loading) {
    return (
      <RecordTableInlineCell>
        <Skeleton className="h-4 w-28" />
      </RecordTableInlineCell>
    );
  }

  if (!page) {
    return (
      <RecordTableInlineCell className="text-muted-foreground">
        {t('bot-page-unresolved', { defaultValue: 'No single page' })}
      </RecordTableInlineCell>
    );
  }

  return (
    <RecordTableInlineCell className="min-w-0 p-0">
      <FacebookBotSheet page={page} bot={bot}>
        <Button
          variant="ghost"
          className="h-8 w-full justify-start overflow-hidden px-2 font-normal"
        >
          {bot ? (
            <FacebookBotSummary bot={bot} />
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <IconPlus className="size-3.5" />
              {t('create-bot', { defaultValue: 'Create bot' })}
            </span>
          )}
        </Button>
      </FacebookBotSheet>
    </RecordTableInlineCell>
  );
};
