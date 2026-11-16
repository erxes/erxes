import { CreatePipelinePanelForm } from '@/pipelines/components/CreatePipeline';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import {
  getPipelinePath,
  parsePipelineRecordId,
} from '@/pipelines/constants/pipelineTabs';
import { PIPELINE_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { SettingsPanelContext } from '@/settings/contexts/SettingsPanelContext';
import { SettingsPanelForm } from '@/settings/components/SettingsPanelForm';
import { Button, Empty, ScrollArea, Skeleton, Spinner } from 'erxes-ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import {
  ActivityLogs,
  SIDE_PANEL_HISTORY_QUERY_KEY,
  SIDE_PANEL_QUERY_KEY,
  type IRecordPanelProps,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';

/** Prompts users to select a channel before creating a pipeline. */
const PipelineChannelRequired = () => {
  const { t } = useTranslation('frontline');
  return (
    <Empty>
      <Empty.Header>
        <Empty.Title>
          {t('select-channel-first', 'Select a channel first')}
        </Empty.Title>
      </Empty.Header>
      <Empty.Content>
        <Button asChild variant="outline">
          <Link to="/frontline/settings/channels">
            {t('channels', 'Channels')}
          </Link>
        </Button>
      </Empty.Content>
    </Empty>
  );
};

/** Offers a return to the pipeline creation form from draft Activity. */
const PipelineDraftActivity = () => {
  const { t } = useTranslation('frontline');
  const { setTab } = useSidePanel();
  return (
    <Empty>
      <Empty.Header>
        <Empty.Title>{t('create-pipeline', 'Create pipeline')}</Empty.Title>
      </Empty.Header>
      <Empty.Content>
        <Button onClick={() => setTab('detail')}>
          {t('create-pipeline', 'Create pipeline')}
        </Button>
      </Empty.Content>
    </Empty>
  );
};

/** Renders the pipeline create title, loading placeholder, or saved name. */
const PipelineRecordTitle = ({
  isNew,
  name,
  loading,
}: {
  isNew: boolean;
  name?: string;
  loading: boolean;
}) => {
  const { t } = useTranslation('frontline');
  if (isNew) return t('create-pipeline', 'Create pipeline');
  if (loading && !name) return <Skeleton className="h-4 w-32" />;
  return name || t('pipeline', 'Pipeline');
};

/** Resolves the channel from loaded data, then encoded, draft, and route scope. */
const getPipelinePanelChannelId = (
  pipeline: ReturnType<typeof useGetPipeline>['pipeline'],
  encodedChannelId: string | undefined,
  draftChannelId: string | undefined,
  routeChannelId: string | undefined,
): string | undefined =>
  pipeline?.channelId || encodedChannelId || draftChannelId || routeChannelId;

/** Resolves pipeline scope and renders its requested settings panel view. */
export const PipelineRecordPanel = ({ contentId, view }: IRecordPanelProps) => {
  const { t } = useTranslation('frontline');
  const location = useLocation();
  const { record } = useSidePanel();
  const parsed = parsePipelineRecordId(contentId);
  const { id: routeChannelId } = useParams<{ id: string }>();
  const draft = useSidePanelDraft<{ channelId: string }>(PIPELINE_CONTENT_TYPE);
  const { pipeline, loading, error } = useGetPipeline(parsed.pipelineId);
  const channelId = getPipelinePanelChannelId(
    pipeline,
    parsed.channelId,
    draft.channelId,
    routeChannelId,
  );
  const panelScope = useMemo(
    () => ({
      channelId: parsed.isNew ? channelId : pipeline?.channelId ?? undefined,
      pipelineId: parsed.isNew ? undefined : pipeline?._id,
    }),
    [parsed.isNew, channelId, pipeline?.channelId, pipeline?._id],
  );

  if (view === 'title')
    return (
      <PipelineRecordTitle
        isNew={parsed.isNew}
        name={pipeline?.name}
        loading={loading}
      />
    );
  if (view === 'actions') return null;
  if (parsed.isNew) {
    if (view === 'activity') return <PipelineDraftActivity />;
    if (!channelId) return <PipelineChannelRequired />;
    return (
      <SettingsPanelContext.Provider value={panelScope}>
        <SettingsPanelForm>
          <CreatePipelinePanelForm key={channelId} channelId={channelId} />
        </SettingsPanelForm>
      </SettingsPanelContext.Provider>
    );
  }
  if (loading && !pipeline) return <Spinner containerClassName="py-12" />;
  if (!pipeline) {
    return (
      <Empty>
        <Empty.Header>
          <Empty.Title>{t('not-found', 'Not found')}</Empty.Title>
          <Empty.Description>{error?.message}</Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }
  if (view === 'activity') {
    return (
      <ScrollArea className="min-h-0 flex-1" viewportClassName="[&>div]:block!">
        <ActivityLogs targetId={pipeline._id} showInternalNotes={false} />
      </ScrollArea>
    );
  }
  if (
    record?.contentType !== PIPELINE_CONTENT_TYPE ||
    record.contentId !== contentId
  )
    return null;
  if (!pipeline.channelId) return <PipelineChannelRequired />;
  const params = new URLSearchParams(location.search);
  params.delete(SIDE_PANEL_QUERY_KEY);
  params.delete(SIDE_PANEL_HISTORY_QUERY_KEY);
  params.delete('panelExpanded');
  return (
    <Navigate
      to={{
        pathname: getPipelinePath(
          pipeline.channelId,
          pipeline._id,
          parsed.segment,
        ),
        search: params.toString(),
        hash: location.hash,
      }}
      replace
      state={location.state}
    />
  );
};
