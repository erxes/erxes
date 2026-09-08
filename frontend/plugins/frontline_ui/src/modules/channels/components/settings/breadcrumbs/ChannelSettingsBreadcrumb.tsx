import { ChannelDetailBreadcrumb } from '@/channels/components/settings/breadcrumbs/ChannelDetailBreadcrumb';
import { CreateChannel } from '@/channels/components/settings/channels-list/CreateChannel';
import { FormDetailsBreadcrumb } from '@/forms/components/FormDetailsBreadcrumb';
import { FormsCreateButton } from '@/forms/components/form-page/forms-create';
import { CreatePipeline } from '@/pipelines/components/CreatePipeline';
import { PollsCreateButton } from '@/poll/components/poll-page/polls-create';
import { PipelineDetailBreadcrumb } from '@/pipelines/components/PipelineDetailBreadcrumb';
import { ResponseDetailBreadcrumb } from '@/responseTemplate/components/ResponseDetailBreadcrumb';
import { CreateResponse } from '@/responseTemplate/components/CreateResponse';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { IconCircles } from '@tabler/icons-react';
import { Button, Separator, useIsMatchingLocation } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { MembersBreadcrumb } from '../members/MembersBreadcrumb';
import { useTranslation } from 'react-i18next';

export const ChannelSettingsBreadcrumb = () => {
  const { t } = useTranslation('frontline');
  const isMatchingLocation = useIsMatchingLocation(
    '/settings/frontline/channels',
  );
  const { id: channelId } = useParams<{ id: string }>();

  const isSpecificPipelineDetailRoute = isMatchingLocation(
    FrontlinePaths.PipelineDetailCatchAll,
  );

  const isAnyPipelineRoute =
    isMatchingLocation(FrontlinePaths.ChannelPipelines) ||
    isSpecificPipelineDetailRoute;

  const isChannelDetailOrSubRoute =
    isMatchingLocation(FrontlinePaths.ChannelDetails) ||
    isMatchingLocation(FrontlinePaths.ChannelMembers) ||
    isAnyPipelineRoute ||
    isMatchingLocation(`/${FrontlinePaths.ChannelIntegrations}`);

  const isFormsRoute =
    isMatchingLocation(FrontlinePaths.ChannelForms) ||
    isMatchingLocation(FrontlinePaths.FormsCreate) ||
    isMatchingLocation(FrontlinePaths.FormSubmissions) ||
    isMatchingLocation(FrontlinePaths.FormDetail);

  const isPollsRoute = isMatchingLocation(FrontlinePaths.ChannelPolls);

  const isResponseTemplates =
    isMatchingLocation(FrontlinePaths.ChannelResponsePage) ||
    isMatchingLocation(FrontlinePaths.ResponseDetail);
  const isChannelsRoot =
    !isChannelDetailOrSubRoute &&
    !isFormsRoute &&
    !isPollsRoute &&
    !isResponseTemplates;

  return (
    <>
      <Link to="/settings/frontline/channels">
        <Button variant="ghost" className="font-semibold">
          <IconCircles className="w-4 h-4 text-accent-foreground" />
          {t('channels')}
        </Button>
      </Link>

      {isChannelsRoot && (
        <span className="ml-auto">
          <CreateChannel />
        </span>
      )}

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
      {isResponseTemplates && (
        <>
          <Separator.Inline />
          <ChannelDetailBreadcrumb channelId={channelId} />
          <Separator.Inline />
          <Link to={`/settings/frontline/channels/${channelId}/response`}>
            <Button variant="ghost" className="font-semibold">
              {t('response-templates')}
            </Button>
          </Link>
          {!isMatchingLocation(FrontlinePaths.ResponseDetail) && (
            <span className="ml-auto">
              <CreateResponse />
            </span>
          )}
        </>
      )}
      {isMatchingLocation(FrontlinePaths.ResponseDetail) && (
        <>
          <Separator.Inline />
          <ResponseDetailBreadcrumb />
        </>
      )}

      {isAnyPipelineRoute && (
        <>
          <Separator.Inline />
          <Link to={`/settings/frontline/channels/${channelId}/pipelines`}>
            <Button variant="ghost" className="font-semibold">
              {t('pipelines')}
            </Button>
          </Link>
          {!isSpecificPipelineDetailRoute && (
            <span className="ml-auto">
              <CreatePipeline />
            </span>
          )}
        </>
      )}

      {isSpecificPipelineDetailRoute && (
        <>
          <Separator.Inline />
          <PipelineDetailBreadcrumb />
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
              {t('forms')}
            </Button>
          </Link>
          {!isMatchingLocation(FrontlinePaths.FormDetail) && (
            <span className="ml-auto">
              <FormsCreateButton />
            </span>
          )}
        </>
      )}

      {isPollsRoute && (
        <>
          <Separator.Inline />
          <ChannelDetailBreadcrumb channelId={channelId} />
          <Separator.Inline />
          <Link to={`/settings/frontline/channels/${channelId}/polls`}>
            <Button variant="ghost" className="font-semibold">
              {t('polls')}
            </Button>
          </Link>
          <span className="ml-auto">
            <PollsCreateButton />
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
            {t('create-form')}
          </Button>
        </>
      )}
    </>
  );
};
