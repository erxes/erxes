import { Link } from 'react-router-dom';
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
          <Button variant="ghost" className="font-semibold">
            Pipelines
          </Button>
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
