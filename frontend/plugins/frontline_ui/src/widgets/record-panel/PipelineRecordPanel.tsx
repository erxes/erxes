import { CreatePipelinePanelForm } from '@/pipelines/components/CreatePipeline';
import { PipelineActionsMenu } from '@/pipelines/components/PipelinesList';
import { IconDotsVertical } from '@tabler/icons-react';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import {
  getPipelineRecordId,
  parsePipelineRecordId,
  PIPELINE_TABS,
  type TPipelineTabSegment,
} from '@/pipelines/constants/pipelineTabs';
import { PIPELINE_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { SettingsPanelContext } from '@/settings/contexts/SettingsPanelContext';
import { SettingsPanelForm } from '@/settings/components/SettingsPanelForm';
import { Button, Empty, ScrollArea, Skeleton, Spinner, Tabs } from 'erxes-ui';
import { lazy, Suspense, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import {
  ActivityLogs,
  type IRecordPanelProps,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';

const PipelineDetailPage = lazy(() =>
  import('~/pages/PipelineDetailPage').then((module) => ({
    default: module.PipelineDetailPage,
  })),
);
const PipelinePermissionsPage = lazy(() =>
  import('~/pages/PipelinePermissionsPage').then((module) => ({
    default: module.PipelinePermissionsPage,
  })),
);
const PipelinePropertiesPage = lazy(() =>
  import('~/pages/PipelinePropertiesPage').then((module) => ({
    default: module.PipelinePropertiesPage,
  })),
);
const PipelineMailPage = lazy(() =>
  import('~/pages/PipelineMailPage').then((module) => ({
    default: module.PipelineMailPage,
  })),
);
const PipelineConfigsPage = lazy(() =>
  import('~/pages/PipelineConfigsPage').then((module) => ({
    default: module.PipelineConfigsPage,
  })),
);
const TicketStatusesPage = lazy(() =>
  import('~/pages/TicketStatusesPage').then((module) => ({
    default: module.TicketStatusesPage,
  })),
);

const PipelineSettingsSections = ({
  pipelineId,
  segment,
}: {
  pipelineId: string;
  segment: TPipelineTabSegment;
}) => {
  const { t } = useTranslation('frontline');
  const { openRecord } = useSidePanel();
  const sections: Record<TPipelineTabSegment, ReactNode> = {
    '': <PipelineDetailPage />,
    statuses: <TicketStatusesPage />,
    configs: <PipelineConfigsPage />,
    permissions: <PipelinePermissionsPage />,
    properties: <PipelinePropertiesPage />,
    mail: <PipelineMailPage />,
  };
  const value = segment || 'general';
  return (
    <Tabs
      className="flex min-h-0 flex-1 flex-col"
      value={value}
      onValueChange={(next) =>
        openRecord(
          {
            contentType: PIPELINE_CONTENT_TYPE,
            contentId: getPipelineRecordId(
              pipelineId,
              PIPELINE_TABS.find((tab) => tab.segment === next)?.segment ?? '',
            ),
          },
          { replace: true },
        )
      }
    >
      <Tabs.List className="h-auto w-full shrink-0 flex-wrap justify-start gap-1 border-b p-2">
        {PIPELINE_TABS.map((tab) => (
          <Tabs.Trigger key={tab.labelKey} value={tab.segment || 'general'}>
            {t(tab.labelKey, tab.defaultLabel ?? tab.labelKey)}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.Content
        value={value}
        className="m-0 min-h-0 flex-1 overflow-y-auto p-4"
      >
        <Suspense fallback={<Spinner containerClassName="py-12" />}>
          {sections[segment]}
        </Suspense>
      </Tabs.Content>
    </Tabs>
  );
};

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

const PipelineRecordActions = ({
  pipeline,
}: {
  pipeline: ReturnType<typeof useGetPipeline>['pipeline'];
}) => {
  const { t } = useTranslation('frontline');
  if (!pipeline) return null;
  return (
    <PipelineActionsMenu
      pipeline={pipeline}
      trigger={
        <Button
          size="icon"
          variant="ghost"
          className="size-7"
          aria-label={t('actions', 'Actions')}
        >
          <IconDotsVertical />
        </Button>
      }
    />
  );
};

const getPipelinePanelChannelId = (
  pipeline: ReturnType<typeof useGetPipeline>['pipeline'],
  encodedChannelId: string | undefined,
  draftChannelId: string | undefined,
  routeChannelId: string | undefined,
): string | undefined =>
  pipeline?.channelId || encodedChannelId || draftChannelId || routeChannelId;

export const PipelineRecordPanel = ({ contentId, view }: IRecordPanelProps) => {
  const { t } = useTranslation('frontline');
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

  if (view === 'title')
    return (
      <PipelineRecordTitle
        isNew={parsed.isNew}
        name={pipeline?.name}
        loading={loading}
      />
    );
  if (view === 'actions') return <PipelineRecordActions pipeline={pipeline} />;
  if (parsed.isNew) {
    if (view === 'activity') return <PipelineDraftActivity />;
    if (!channelId) return <PipelineChannelRequired />;
    return (
      <SettingsPanelContext.Provider value={{ channelId }}>
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
  return (
    <SettingsPanelContext.Provider
      key={pipeline._id}
      value={{
        channelId: pipeline.channelId ?? undefined,
        pipelineId: pipeline._id,
      }}
    >
      <SettingsPanelForm>
        <PipelineSettingsSections
          pipelineId={pipeline._id}
          segment={parsed.segment}
        />
      </SettingsPanelForm>
    </SettingsPanelContext.Provider>
  );
};
