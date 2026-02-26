import { Link, useParams } from 'react-router-dom';
import { Button } from 'erxes-ui';
import { IconCircles } from '@tabler/icons-react';
import { Separator } from 'erxes-ui';
import { useIsMatchingLocation } from 'erxes-ui';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { ChannelDetailBreadcrumb } from '@/channels/components/settings/breadcrumbs/ChannelDetailBreadcrumb';
import { PipelineDetailBreadcrumb } from '@/pipelines/components/PipelineDetailBreadcrumb';
import { PipelineConfigBreadcrumb } from '@/pipelines/components/configs/components/PipelineConfigBreadcrumb';
import { MembersBreadcrumb } from '../members/MembersBreadcrumb';
import { TicketStatusesBreadcrumb } from '@/status/components/TicketStatusesBreadcrumb';
import { ResponseDetailBreadcrumb } from '@/responseTemplate/components/ResponseDetailBreadcrumb';
import { FormDetailsBreadcrumb } from '@/forms/components/FormDetailsBreadcrumb';
import { FormsCreateButton } from '@/forms/components/form-page/forms-create';
export const ChannelSettingsBreadcrumb = () => {
  const isMatchingLocation = useIsMatchingLocation(
    '/settings/frontline/channels',
  );
  const { id: channelId } = useParams<{ id: string }>();

  return (
    <>
      <Link to="/settings/frontline/channels">
        <Button variant="ghost" className="font-semibold">
          <IconCircles className="w-4 h-4 text-accent-foreground" />
          Channels
        </Button>
      </Link>
      {(isMatchingLocation(FrontlinePaths.ChannelDetails) ||
        isMatchingLocation(FrontlinePaths.ChannelMembers) ||
        isMatchingLocation(FrontlinePaths.ChannelPipelines) ||
        isMatchingLocation(FrontlinePaths.PipelineDetail) ||
        isMatchingLocation(FrontlinePaths.TicketsConfigs) ||
        isMatchingLocation(FrontlinePaths.TicketsStatuses) ||
        isMatchingLocation(FrontlinePaths.ChannelResponsePage) ||
        isMatchingLocation(FrontlinePaths.ResponseDetail) ||
        isMatchingLocation(`/${FrontlinePaths.ChannelIntegrations}`)) && (
          <>
            <Separator.Inline />
            <ChannelDetailBreadcrumb />
          </>
        )}
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

      {/* Forms: /:id/forms, /:id/forms/create, /:id/forms/:formId */}
      {(isMatchingLocation(FrontlinePaths.ChannelForms) ||
        isMatchingLocation(FrontlinePaths.FormsCreate) ||
        isMatchingLocation(FrontlinePaths.FormDetail)) && (
          <>
            <Separator.Inline />
            <ChannelDetailBreadcrumb channelId={channelId} />
          </>
        )}
      {(isMatchingLocation(FrontlinePaths.ChannelForms) ||
        isMatchingLocation(FrontlinePaths.FormsCreate) ||
        isMatchingLocation(FrontlinePaths.FormDetail)) && (
          <>
            <Separator.Inline />
            <Link to={`/settings/frontline/channels/${channelId}/forms`}>
              <Button variant="ghost" className="font-semibold">
                Forms
              </Button>
            </Link>
            <span className='ml-auto'>
              <FormsCreateButton />
            </span>
          </>
        )}
      {isMatchingLocation(FrontlinePaths.FormDetail) &&
        !isMatchingLocation(FrontlinePaths.FormsCreate) && (
          <>
            <Separator.Inline />
            <FormDetailsBreadcrumb />
          </>
        )}
      {isMatchingLocation(FrontlinePaths.FormsCreate) && (
        <>
          <Separator.Inline />
          <Button variant="ghost" className="font-semibold">
            Create form
          </Button>
        </>
      )}
    </>
  );
};
