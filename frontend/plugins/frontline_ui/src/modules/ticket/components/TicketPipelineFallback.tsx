import { IconBrandTrello, IconSettings } from '@tabler/icons-react';
import { Button, Empty, cn, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const TicketPipelineFallback = ({
  className,
}: {
  className?: string;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.ticket' });
  const [channelId] = useQueryState<string | null>('channelId');
  const settingsPath = channelId
    ? `/frontline/settings/channels/${channelId}/pipelines`
    : '/frontline/settings/channels';

  return (
    <Empty className={cn('h-full w-full rounded-none border-0', className)}>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconBrandTrello />
        </Empty.Media>
        <Empty.Title>
          {channelId ? t('no-pipeline-yet') : t('select-channel-first')}
        </Empty.Title>
        <Empty.Description>
          {channelId
            ? t('create-pipeline-description')
            : t('select-channel-for-tickets-description')}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button variant="outline" asChild className="z-10">
          <Link to={settingsPath}>
            <IconSettings />
            {channelId ? t('manage-pipelines') : t('manage-channels')}
          </Link>
        </Button>
      </Empty.Content>
    </Empty>
  );
};

export const TicketStatusesFallback = ({
  className,
}: {
  className?: string;
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.ticket' });
  const [channelId] = useQueryState<string | null>('channelId');
  const [pipelineId] = useQueryState<string | null>('pipelineId');

  const getSettingsPath = () => {
    if (!channelId) return '/frontline/settings/channels';
    if (pipelineId) {
      return `/frontline/settings/channels/${channelId}/pipelines/${pipelineId}`;
    }
    return `/frontline/settings/channels/${channelId}/pipelines`;
  };

  const settingsPath = getSettingsPath();

  return (
    <Empty className={cn('h-full w-full rounded-none border-0', className)}>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconBrandTrello />
        </Empty.Media>
        <Empty.Title>{t('no-ticket-lists')}</Empty.Title>
        <Empty.Description>
          {t('no-ticket-lists-description')}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button variant="outline" asChild className="z-10">
          <Link to={settingsPath}>
            <IconSettings />
            {t('manage-pipeline')}
          </Link>
        </Button>
      </Empty.Content>
    </Empty>
  );
};
