import { Link, useParams } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { IconMail } from '@tabler/icons-react';
import { Separator } from 'erxes-ui';
import { useIsMatchingLocation } from 'erxes-ui';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { ChannelDetailBreadcrumb } from '@/channels/components/settings/breadcrumbs/ChannelDetailBreadcrumb';
import { PipelineDetailBreadcrumb } from '@/pipelines/components/PipelineDetailBreadcrumb';
export const ChannelSettingsBreadcrumb = () => {
  const isMatchingLocation = useIsMatchingLocation(
    '/settings/frontline/channels',
  );
  const { id: channelId } = useParams<{ id: string }>();

  return (
    <>
      <Link to="/settings/frontline/channels">
        <Button variant="ghost" className="font-semibold">
          <IconMail className="w-4 h-4 text-accent-foreground" />
          Channels
        </Button>
      </Link>
      {(isMatchingLocation(FrontlinePaths.ChannelDetails) ||
        isMatchingLocation(FrontlinePaths.ChannelPipelines) ||
        isMatchingLocation(FrontlinePaths.PipelineDetail)) && (
        <>
          <Separator.Inline />
          <ChannelDetailBreadcrumb />
        </>
      )}
      {(isMatchingLocation(FrontlinePaths.ChannelPipelines) ||
        isMatchingLocation(FrontlinePaths.PipelineDetail)) && (
        <>
          <Separator.Inline />
          <Link to={`/settings/frontline/channels/${channelId}/pipelines`}>
            <Button variant="ghost" className="font-semibold">
              Pipelines
            </Button>
          </Link>
        </>
      )}
      {isMatchingLocation(FrontlinePaths.PipelineDetail) && (
        <>
          <Separator.Inline />
          <PipelineDetailBreadcrumb />
        </>
      )}
    </>
  );
};
