import { IconExternalLink, IconInfoCircle } from '@tabler/icons-react';
import { Link } from 'react-router';
import { Button, Popover } from 'erxes-ui';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { TFacebookPage } from '@/integrations/facebook/hooks/useFacebookPages';
import { useFacebookPageUsage } from '@/integrations/facebook/hooks/useFacebookPageUsage';
import { FacebookBotAutomations } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotAutomations';
import { FacebookBotSummary } from '~/widgets/automations/modules/facebook/components/bots/components/FacebookBotSummary';

const UsageRow = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div className="flex items-center gap-3">
    <span className="w-24 shrink-0 text-muted-foreground">{label}</span>
    <div className="min-w-0 flex-1 truncate">{children}</div>
  </div>
);

/** Shows, inside the wizard, everything already built on a connected page. */
export const FacebookPageUsage = ({ page }: { page: TFacebookPage }) => {
  const { t } = useTranslation('frontline');
  const {
    hasUsage,
    usage,
    bot,
    channelName,
    integrationName,
    summary,
    manageUrl,
  } = useFacebookPageUsage(page);

  if (!hasUsage) {
    return null;
  }

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          onClick={(e) => e.stopPropagation()}
          className="h-10 max-w-[55%] shrink-0 gap-1 rounded-none px-3 text-xs font-normal text-muted-foreground"
          aria-label={t('page-usage', {
            defaultValue: 'Where this page is used',
          })}
        >
          <span className="truncate">{summary}</span>
          <IconInfoCircle className="size-4! shrink-0" />
        </Button>
      </Popover.Trigger>
      {/* Portalled events still bubble to the row, which would pick the page */}
      <Popover.Content
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        align="end"
        className="flex w-96 flex-col gap-3 p-3 text-sm"
      >
        {usage && (
          <>
            <UsageRow label={t('channel', { defaultValue: 'Channel' })}>
              {channelName}
            </UsageRow>
            <UsageRow label={t('integration', { defaultValue: 'Integration' })}>
              {integrationName}
            </UsageRow>
          </>
        )}
        <UsageRow label={t('bot', { defaultValue: 'Bot' })}>
          <FacebookBotSummary bot={bot} />
        </UsageRow>
        {bot && <FacebookBotAutomations botId={bot._id} openInNewTab />}
        {manageUrl && (
          <Button variant="outline" size="sm" className="self-start" asChild>
            <Link to={manageUrl} target="_blank" rel="noreferrer">
              {t('manage-integration', { defaultValue: 'Manage integration' })}
              <IconExternalLink />
            </Link>
          </Button>
        )}
      </Popover.Content>
    </Popover>
  );
};
