import { ChannelDetailBreadcrumb } from '@/channels/components/settings/breadcrumbs/ChannelDetailBreadcrumb';
import { FormDetailsBreadcrumb } from '@/forms/components/FormDetailsBreadcrumb';
import { FormsCreateButton } from '@/forms/components/form-page/forms-create';
import { PipelineDetailBreadcrumb } from '@/pipelines/components/PipelineDetailBreadcrumb';
import { PipelineConfigBreadcrumb } from '@/pipelines/components/configs/components/PipelineConfigBreadcrumb';
import { PipelinePermissionsBreadcrumb } from '@/pipelines/components/permissions/components/PipelinePermissionsBreadcrumb';
import { ResponseDetailBreadcrumb } from '@/responseTemplate/components/ResponseDetailBreadcrumb';
import { TicketStatusesBreadcrumb } from '@/status/components/TicketStatusesBreadcrumb';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { IconCircles } from '@tabler/icons-react';
import { Button, Separator, useIsMatchingLocation } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { MembersBreadcrumb } from '../members/MembersBreadcrumb';

export const ChannelSettingsBreadcrumb = () => {
  const isMatchingLocation = useIsMatchingLocation(
    '/settings/frontline/channels',
  );
  const { id: channelId } = useParams<{ id: string }>();

  const isChannelDetailOrSubRoute =
    isMatchingLocation(FrontlinePaths.ChannelDetails) ||
    isMatchingLocation(FrontlinePaths.ChannelMembers) ||
    isMatchingLocation(FrontlinePaths.ChannelPipelines) ||
    isMatchingLocation(FrontlinePaths.PipelineDetail) ||
    isMatchingLocation(FrontlinePaths.TicketsConfigs) ||
    isMatchingLocation(FrontlinePaths.TicketsStatuses) ||
    isMatchingLocation(FrontlinePaths.ChannelResponsePage) ||
    isMatchingLocation(FrontlinePaths.ResponseDetail) ||
    isMatchingLocation(FrontlinePaths.PipelinePermissions) ||
    isMatchingLocation(`/${FrontlinePaths.ChannelIntegrations}`);

  const isAnyPipelineRoute =
    isMatchingLocation(FrontlinePaths.ChannelPipelines) ||
    isMatchingLocation(FrontlinePaths.PipelineDetail) ||
    isMatchingLocation(FrontlinePaths.TicketsConfigs) ||
    isMatchingLocation(FrontlinePaths.PipelinePermissions) ||
    isMatchingLocation(FrontlinePaths.ResponseDetail) ||
    isMatchingLocation(FrontlinePaths.TicketsStatuses);

  const isSpecificPipelineDetailRoute =
    isMatchingLocation(FrontlinePaths.PipelineDetail) ||
    isMatchingLocation(FrontlinePaths.TicketsConfigs) ||
    isMatchingLocation(FrontlinePaths.PipelinePermissions) ||
    isMatchingLocation(FrontlinePaths.ResponseDetail) ||
    isMatchingLocation(FrontlinePaths.TicketsStatuses);

  const isFormsRoute =
    isMatchingLocation(FrontlinePaths.ChannelForms) ||
    isMatchingLocation(FrontlinePaths.FormsCreate) ||
    isMatchingLocation(FrontlinePaths.FormDetail);

  return (
    <>
      <Link to="/settings/frontline/channels">
        <Button variant="ghost" className="font-semibold">
          <IconCircles className="w-4 h-4 text-accent-foreground" />
          Channels
        </Button>
      </Link>

      {isChannelDetailOrSubRoute && (
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

      {isAnyPipelineRoute && (
        <>
          <Separator.Inline />
          <Link to={`/settings/frontline/channels/${channelId}/pipelines`}>
            <Button variant="ghost" className="font-semibold">
              Pipelines
            </Button>
          </Link>
        </>
      )}

      {isSpecificPipelineDetailRoute && (
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

      {/* Forms: /:id/forms, /:id/forms/create, /:id/forms/:formId */}
      {isFormsRoute && (
        <>
          <Separator.Inline />
          <ChannelDetailBreadcrumb channelId={channelId} />
          <Separator.Inline />
          <Link to={`/settings/frontline/channels/${channelId}/forms`}>
            <Button variant="ghost" className="font-semibold">
              Forms
            </Button>
          </Link>
          {!isMatchingLocation(FrontlinePaths.FormDetail) && (
            <span className="ml-auto">
              <FormsCreateButton />
            </span>
          )}
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
