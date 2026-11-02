import { TicketConfigEditor } from '@/pipelines/components/configs/components/CreateConfig';
import { useGetTicketConfigDetail } from '@/pipelines/components/configs/hooks/useGetTicketConfigDetail';
import { TICKET_CONFIG_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import {
  SettingsPanelContext,
  type ISettingsPanelScope,
  useSettingsParams,
} from '@/settings/contexts/SettingsPanelContext';
import { SettingsPanelForm } from '@/settings/components/SettingsPanelForm';
import { Button, Empty, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  ActivityLogs,
  type IRecordPanelProps,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';

const getTicketConfigPanelScope = (
  config: ReturnType<typeof useGetTicketConfigDetail>['ticketConfigDetail'],
  encoded: ISettingsPanelScope,
  draft: ISettingsPanelScope,
  route: ISettingsPanelScope,
): ISettingsPanelScope => ({
  channelId:
    config?.channelId ||
    encoded.channelId ||
    draft.channelId ||
    route.channelId,
  pipelineId:
    config?.pipelineId ||
    encoded.pipelineId ||
    draft.pipelineId ||
    route.pipelineId,
});

const TicketConfigDraftActivity = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });
  const { setTab } = useSidePanel();
  return (
    <Empty>
      <Empty.Header>
        <Empty.Title>
          {t('messenger-configuration', 'Messenger Configuration')}
        </Empty.Title>
      </Empty.Header>
      <Empty.Content>
        <Button onClick={() => setTab('detail')}>
          {t('create', 'Create')}
        </Button>
      </Empty.Content>
    </Empty>
  );
};

const TicketConfigUnavailable = ({ error }: { error?: Error }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });
  return (
    <Empty>
      <Empty.Header>
        <Empty.Title>
          {t('messenger-configuration', 'Messenger Configuration')}
        </Empty.Title>
        <Empty.Description>
          {error?.message || t('not-found', { keyPrefix: '' })}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

export const TicketConfigRecordPanel = ({
  contentId,
  view,
}: IRecordPanelProps) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });
  const [draftPrefix, encodedChannelId, encodedPipelineId] =
    contentId.split('~');
  const isNew = draftPrefix === 'new';
  const {
    ticketConfigDetail: config,
    loading,
    error,
  } = useGetTicketConfigDetail({ variables: { id: contentId }, skip: isNew });
  const draft = useSidePanelDraft<{ channelId: string; pipelineId: string }>(
    TICKET_CONFIG_CONTENT_TYPE,
  );
  const { id, pipelineId: routePipelineId } = useSettingsParams();
  const { back, canGoBack, close } = useSidePanel();
  const onClose = () => (canGoBack ? back() : close());
  if (view === 'title')
    return (
      config?.name || t('messenger-configuration', 'Messenger Configuration')
    );
  if (view === 'actions') return null;
  if (!isNew && loading && !config)
    return <Spinner containerClassName="py-12" />;
  const { channelId, pipelineId } = getTicketConfigPanelScope(
    config,
    { channelId: encodedChannelId, pipelineId: encodedPipelineId },
    draft,
    { channelId: id, pipelineId: routePipelineId },
  );
  if ((!isNew && !config) || !channelId || !pipelineId)
    return <TicketConfigUnavailable error={error} />;
  if (view === 'activity')
    return isNew ? (
      <TicketConfigDraftActivity />
    ) : (
      <ActivityLogs targetId={contentId} showInternalNotes={false} />
    );
  return (
    <SettingsPanelContext.Provider value={{ channelId, pipelineId }}>
      <SettingsPanelForm>
        <TicketConfigEditor key={contentId} config={config} onClose={onClose} />
      </SettingsPanelForm>
    </SettingsPanelContext.Provider>
  );
};
