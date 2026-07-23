import { IconLayoutCards, IconTicket } from '@tabler/icons-react';
import {
  Breadcrumb,
  Button,
  Separator,
  Skeleton,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { createFavoriteBreadcrumb, PageHeader } from 'ui-modules';
import { Link } from 'react-router-dom';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';

export const TicketBreadcrumb = () => {
  const { t } = useTranslation('frontline');
  const [channelId] = useQueryState<string | null>('channelId');
  const [pipelineId] = useQueryState<string | null>('pipelineId');
  const { channels, loading: channelsLoading } = useGetChannels();
  const { pipeline, loading: pipelineLoading } = useGetPipeline(
    pipelineId || undefined,
  );
  const channel = channels?.find(({ _id }) => _id === channelId);
  const breadcrumb = createFavoriteBreadcrumb(
    channel?.name,
    pipeline?.name,
    t('tickets'),
  );

  if ((channelId && channelsLoading) || (pipelineId && pipelineLoading)) {
    return <Skeleton className="w-12 h-lh" />;
  }

  return (
    <>
      {channel && (
        <>
          <Breadcrumb.Item>
            <span className="flex items-center gap-1">{channel.name}</span>
          </Breadcrumb.Item>
          <Separator.Inline />
        </>
      )}
      {pipeline && (
        <>
          <Breadcrumb.Item>
            <span className="flex items-center gap-1">
              <IconLayoutCards />
              {pipeline.name}
            </span>
          </Breadcrumb.Item>
          <Separator.Inline />
        </>
      )}
      <Breadcrumb.Item>
        <Button variant="ghost" asChild>
          <Link to="/frontline/tickets">
            <IconTicket />
            {t('tickets')}
          </Link>
        </Button>
      </Breadcrumb.Item>
      <Breadcrumb.Item className="ml-1">
        <PageHeader.FavoriteToggleButton
          breadcrumb={breadcrumb}
          icon="IconTicket"
        />
      </Breadcrumb.Item>
    </>
  );
};
