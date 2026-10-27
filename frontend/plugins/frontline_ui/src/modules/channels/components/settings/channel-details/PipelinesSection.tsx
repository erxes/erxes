import { IChannelDetail } from '@/channels/types';
import { useGetPipelines } from '@/pipelines/hooks/useGetPipelines';
import { useTranslation } from 'react-i18next';
import { PipelineSettingsLink } from '@/pipelines/components/PipelineSettingsLink';

export const PipelinesSection = ({ channel }: { channel: IChannelDetail }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.channels' });
  const { totalCount } = useGetPipelines({
    variables: { filter: { channelId: channel._id, limit: 1 } },
  });

  const count = totalCount ?? 0;

  return (
    <PipelineSettingsLink
      description={t('pipeline', { count })}
      title={t('manage-ticket-pipelines', 'Manage ticket pipelines')}
      to={`/frontline/settings/channels/${channel._id}/pipelines`}
    />
  );
};
