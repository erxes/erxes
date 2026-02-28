import { Link, useParams } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { IconMail } from '@tabler/icons-react';
import { Separator } from 'erxes-ui';
import { useIsMatchingLocation } from 'erxes-ui';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { ChannelDetailBreadcrumb } from '@/channels/components/settings/breadcrumbs/ChannelDetailBreadcrumb';
import { PipelineDetailBreadcrumb } from '@/pipelines/components/PipelineDetailBreadcrumb';
import { PipelineConfigBreadcrumb } from '@/pipelines/components/configs/components/PipelineConfigBreadcrumb';
import { MembersBreadcrumb } from '../members/MembersBreadcrumb';
import { TicketStatusesBreadcrumb } from '@/status/components/TicketStatusesBreadcrumb';
import { ResponseDetailBreadcrumb } from '@/responseTemplate/components/ResponseDetailBreadcrumb';
import { PipelinePermissionsBreadcrumb } from '@/pipelines/components/permissions/components/PipelinePermissionsBreadcrumb';

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
      {((isMatchingLocation(FrontlinePaths.ChannelDetails) ||
        isMatchingLocation(FrontlinePaths.ChannelMembers) ||
        isMatchingLocation(FrontlinePaths.ChannelPipelines) ||
        isMatchingLocation(FrontlinePaths.PipelineDetail) ||
        isMatchingLocation(FrontlinePaths.TicketsConfigs) ||
        isMatchingLocation(FrontlinePaths.PipelinePermissions) ||
        isMatchingLocation(FrontlinePaths.TicketsStatuses)) &&
        (isMatchingLocation(FrontlinePaths.ChannelResponsePage) ||
          isMatchingLocation(FrontlinePaths.ResponseDetail) ||
          isMatchingLocation(FrontlinePaths.TicketsConfigs))) ||
        (isMatchingLocation(`/${FrontlinePaths.ChannelIntegrations}`) && (
          <>
            <Separator.Inline />
            <ChannelDetailBreadcrumb />
          </>
        ))}
      {isMatchingLocation(FrontlinePaths.ChannelMembers) && (
        <>
          <Separator.Inline />
          <MembersBreadcrumb />
        </>
      )}
      {(isMatchingLocation(FrontlinePaths.ChannelPipelines) ||
        isMatchingLocation(FrontlinePaths.PipelineDetail) ||
        isMatchingLocation(FrontlinePaths.TicketsConfigs) ||
        isMatchingLocation(FrontlinePaths.PipelinePermissions) ||
        isMatchingLocation(FrontlinePaths.TicketsStatuses)) && (
        <>
          <Separator.Inline />
          <Link to={`/settings/frontline/channels/${channelId}/pipelines`}>
            <Button variant="ghost" className="font-semibold">
              Pipelines
            </Button>
          </Link>
        </>
      )}
      {(isMatchingLocation(FrontlinePaths.PipelineDetail) ||
        isMatchingLocation(FrontlinePaths.TicketsConfigs) ||
        isMatchingLocation(FrontlinePaths.PipelinePermissions) ||
        isMatchingLocation(FrontlinePaths.TicketsStatuses)) && (
        <>
          <Separator.Inline />
          <PipelineDetailBreadcrumb />
        </>
      )}
      {isMatchingLocation(FrontlinePaths.PipelinePermissions) && (
        <>
          <Separator.Inline />
          <PipelinePermissionsBreadcrumb />
        </>
      )}
      {isMatchingLocation(FrontlinePaths.TicketsConfigs) && (
        <>
          <Separator.Inline />
          <PipelineConfigBreadcrumb />
        </>
      )}
      {isMatchingLocation(FrontlinePaths.TicketsStatuses) && (
        <>
          <Separator.Inline />
          <TicketStatusesBreadcrumb />
        </>
      )}

      {isMatchingLocation(FrontlinePaths.ResponseDetail) && (
        <>
          <Separator.Inline />
          <ResponseDetailBreadcrumb />
        </>
      )}
    </>
  );
};
