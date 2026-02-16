import { Link, useParams } from 'react-router-dom';
import { Button, Separator, Tooltip, useIsMatchingLocation } from 'erxes-ui';
import { IconInfoCircle, IconMail } from '@tabler/icons-react';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { ChannelDetailBreadcrumb } from '@/channels/components/settings/breadcrumbs/ChannelDetailBreadcrumb';
import { PipelineDetailBreadcrumb } from '@/pipelines/components/PipelineDetailBreadcrumb';
import { PipelineConfigBreadcrumb } from '@/pipelines/components/configs/components/PipelineConfigBreadcrumb';
import { MembersBreadcrumb } from '../members/MembersBreadcrumb';
import { TicketStatusesBreadcrumb } from '@/status/components/TicketStatusesBreadcrumb';
import { ResponseDetailBreadcrumb } from '@/responseTemplate/components/ResponseDetailBreadcrumb';
export const ChannelSettingsBreadcrumb = () => {
  const isMatchingLocation = useIsMatchingLocation(
    '/settings/frontline/channels',
  );
  const { id: channelId } = useParams<{ id: string }>();
  const guideUrl =
    'https://erxes.io/guides/68ef769c1a9ddbd30aec6c35/6992b27d5cac46b2ff76b210';

  return (
    <>
      <Link to="/settings/frontline/channels">
        <Button variant="ghost" className="font-semibold">
          <IconMail className="w-4 h-4 text-accent-foreground" />
          Channels
        </Button>
      </Link>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Link to={guideUrl} target="_blank">
            <IconInfoCircle className="size-4 text-accent-foreground" />
          </Link>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <p>Configure communication channels and integrations</p>
        </Tooltip.Content>
      </Tooltip>
      {((isMatchingLocation(FrontlinePaths.ChannelDetails) ||
        isMatchingLocation(FrontlinePaths.ChannelMembers) ||
        isMatchingLocation(FrontlinePaths.ChannelPipelines) ||
        isMatchingLocation(FrontlinePaths.PipelineDetail) ||
        isMatchingLocation(FrontlinePaths.TicketsConfigs) ||
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
        isMatchingLocation(FrontlinePaths.TicketsStatuses)) && (
        <>
          <Separator.Inline />
          <PipelineDetailBreadcrumb />
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
