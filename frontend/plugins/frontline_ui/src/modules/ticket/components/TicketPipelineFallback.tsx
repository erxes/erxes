import { IconBrandTrello, IconSettings } from '@tabler/icons-react';
import { Button, Empty, cn, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const TicketPipelineFallback = ({
  className,
}: {
  className?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [channelId] = useQueryState<string | null>('channelId');
  const settingsPath = channelId
    ? `/settings/frontline/channels/${channelId}/pipelines`
    : '/settings/frontline/channels';

  return (
    <Empty className={cn('h-full w-full rounded-none border-0', className)}>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconBrandTrello />
        </Empty.Media>
        <Empty.Title>
          {channelId
            ? t('no-pipeline-yet')
            : t('select-channel-first', { defaultValue: 'Select a channel' })}
        </Empty.Title>
        <Empty.Description>
          {channelId
            ? t('create-pipeline-description')
            : t('select-channel-for-tickets-description', {
                defaultValue:
                  'Choose or configure a channel before managing ticket pipelines.',
              })}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button variant="outline" asChild className="z-10">
          <Link to={settingsPath}>
            <IconSettings />
            {channelId
              ? t('manage-pipelines')
              : t('manage-channels', { defaultValue: 'Manage channels' })}
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
  const { t } = useTranslation('frontline');
  const [channelId] = useQueryState<string | null>('channelId');
  const [pipelineId] = useQueryState<string | null>('pipelineId');

  const getSettingsPath = () => {
    if (!channelId) return '/settings/frontline/channels';
    if (pipelineId) {
      return `/settings/frontline/channels/${channelId}/pipelines/${pipelineId}`;
    }
    return `/settings/frontline/channels/${channelId}/pipelines`;
  };

  const settingsPath = getSettingsPath();

  return (
    <Empty className={cn('h-full w-full rounded-none border-0', className)}>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconBrandTrello />
        </Empty.Media>
        <Empty.Title>
          {t('no-ticket-lists', { defaultValue: 'No ticket lists available' })}
        </Empty.Title>
        <Empty.Description>
          {t('no-ticket-lists-description', {
            defaultValue:
              'Add a status list to this pipeline, or ask for access to an existing list.',
          })}
        </Empty.Description>
      </Empty.Header>
      <Empty.Content>
        <Button variant="outline" asChild className="z-10">
          <Link to={settingsPath}>
            <IconSettings />
            {t('manage-pipeline', { defaultValue: 'Manage pipeline' })}
          </Link>
        </Button>
      </Empty.Content>
    </Empty>
  );
};
