import { StatusPanelForm } from '@/status/components/StatusSheet';
import { useGetTicketStatusById } from '@/status/hooks/useGetTicketStatus';
import { TICKET_STATUS_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import {
  SettingsPanelContext,
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

const getTicketStatusPanelScope = (
  status: ReturnType<typeof useGetTicketStatusById>['status'],
  encodedPipelineId: string | undefined,
  encodedType: string | undefined,
  draft: Partial<{ pipelineId: string; statusType: number }>,
  routePipelineId: string | undefined,
): { pipelineId: string | undefined; statusType: number } => {
  const parsedType = Number(encodedType);
  return {
    pipelineId:
      status?.pipelineId ||
      encodedPipelineId ||
      draft.pipelineId ||
      routePipelineId,
    statusType:
      status?.type ??
      draft.statusType ??
      (parsedType >= 1 && parsedType <= 6 ? parsedType : 1),
  };
};

const StatusDraftActivity = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.status' });
  const { setTab } = useSidePanel();
  return (
    <Empty>
      <Empty.Header>
        <Empty.Title>{t('status', 'Status')}</Empty.Title>
      </Empty.Header>
      <Empty.Content>
        <Button onClick={() => setTab('detail')}>
          {t('create', 'Create')}
        </Button>
      </Empty.Content>
    </Empty>
  );
};

const TicketStatusUnavailable = ({ error }: { error?: Error }) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.status' });
  return (
    <Empty>
      <Empty.Header>
        <Empty.Title>{t('status', 'Status')}</Empty.Title>
        <Empty.Description>
          {error?.message || t('not-found', { keyPrefix: '' })}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

export const TicketStatusRecordPanel = ({
  contentId,
  view,
}: IRecordPanelProps) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.status' });
  const [draftPrefix, encodedPipelineId, encodedType] = contentId.split('~');
  const isNew = draftPrefix === 'new';
  const { status, loading, error } = useGetTicketStatusById(
    isNew ? undefined : contentId,
  );
  const draft = useSidePanelDraft<{ pipelineId: string; statusType: number }>(
    TICKET_STATUS_CONTENT_TYPE,
  );
  const { pipelineId: routePipelineId } = useSettingsParams();
  const { back, canGoBack, close } = useSidePanel();
  const onClose = () => (canGoBack ? back() : close());
  if (view === 'title') return status?.name || t('status', 'Status');
  if (view === 'actions') return null;
  if (!isNew && loading && !status)
    return <Spinner containerClassName="py-12" />;
  const { pipelineId, statusType } = getTicketStatusPanelScope(
    status,
    encodedPipelineId,
    encodedType,
    draft,
    routePipelineId,
  );
  if ((!isNew && !status) || !pipelineId)
    return <TicketStatusUnavailable error={error} />;
  if (view === 'activity')
    return isNew ? (
      <StatusDraftActivity />
    ) : (
      <ActivityLogs targetId={contentId} showInternalNotes={false} />
    );
  return (
    <SettingsPanelContext.Provider value={{ pipelineId }}>
      <SettingsPanelForm>
        <StatusPanelForm
          key={contentId}
          editingStatus={status}
          statusType={statusType}
          onClose={onClose}
        />
      </SettingsPanelForm>
    </SettingsPanelContext.Provider>
  );
};
