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
import { useEffect, useMemo } from 'react';
import { useGetTicketConfigByPipelineId } from '@/pipelines/components/configs/hooks/useGetTicketConfigByPipelineId';
import {
  ActivityLogs,
  type IRecordPanelProps,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';

/** Resolves config scope from loaded data, then encoded, draft, and route values. */
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

/** Offers a return to the ticket config creation form from draft Activity. */
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

/** Shows a query error or missing-record message for a ticket config. */
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

/** Resolves ticket config scope and renders its requested panel view. */
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
  } = useGetTicketConfigDetail({
    variables: { id: contentId },
    skip: isNew,
  });
  const draft = useSidePanelDraft<{ channelId: string; pipelineId: string }>(
    TICKET_CONFIG_CONTENT_TYPE,
  );
  const { id, pipelineId: routePipelineId } = useSettingsParams();
  const { back, canGoBack, close, openRecord } = useSidePanel();
  /** Returns to the previous stacked record or closes the panel. */
  const onClose = () => (canGoBack ? back() : close());
  const { channelId, pipelineId } = getTicketConfigPanelScope(
    config,
    { channelId: encodedChannelId, pipelineId: encodedPipelineId },
    draft,
    { channelId: id, pipelineId: routePipelineId },
  );
  const {
    ticketConfig: existingConfig,
    loading: checkingConfig,
    error: configError,
  } = useGetTicketConfigByPipelineId({
    variables: { pipelineId: pipelineId ?? '' },
    skip: !isNew,
    fetchPolicy: 'network-only',
  });
  useEffect(() => {
    if (!isNew || !existingConfig || view === 'title' || view === 'actions')
      return;
    openRecord(
      { contentType: TICKET_CONFIG_CONTENT_TYPE, contentId: existingConfig.id },
      { replace: true },
    );
  }, [existingConfig, isNew, openRecord, view]);
  const panelScope = useMemo(
    () => ({ channelId, pipelineId }),
    [channelId, pipelineId],
  );
  if (view === 'title')
    return (
      config?.name || t('messenger-configuration', 'Messenger Configuration')
    );
  if (view === 'actions') return null;
  if (isNew && (checkingConfig || existingConfig))
    return <Spinner containerClassName="py-12" />;
  if (isNew && configError)
    return <TicketConfigUnavailable error={configError} />;
  if (!isNew && loading && !config)
    return <Spinner containerClassName="py-12" />;
  if ((!isNew && !config) || !channelId || !pipelineId)
    return <TicketConfigUnavailable error={error} />;
  if (view === 'activity')
    return isNew ? (
      <TicketConfigDraftActivity />
    ) : (
      <ActivityLogs targetId={contentId} showInternalNotes={false} />
    );
  return (
    <SettingsPanelContext.Provider value={panelScope}>
      <SettingsPanelForm>
        <TicketConfigEditor key={contentId} config={config} onClose={onClose} />
      </SettingsPanelForm>
    </SettingsPanelContext.Provider>
  );
};
