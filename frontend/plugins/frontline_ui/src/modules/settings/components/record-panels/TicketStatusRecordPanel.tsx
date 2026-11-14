import { StatusPanelForm } from '@/status/components/StatusSheet';
import {
  useGetTicketStatus,
  useGetTicketStatusById,
} from '@/status/hooks/useGetTicketStatus';
import { TICKET_STATUS_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import {
  SettingsPanelContext,
  useSettingsParams,
} from '@/settings/contexts/SettingsPanelContext';
import { SettingsPanelForm } from '@/settings/components/SettingsPanelForm';
import { Button, Empty, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import {
  ActivityLogs,
  type IRecordPanelProps,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';

/** Resolves status scope, validating the encoded type before draft defaults. */
const getTicketStatusPanelScope = (
  status: ReturnType<typeof useGetTicketStatusById>['status'],
  encodedPipelineId: string | undefined,
  encodedType: string | undefined,
  draft: Partial<{ pipelineId: string; statusType: number }>,
  routePipelineId: string | undefined,
): { pipelineId: string | undefined; statusType: number } => {
  const parsedType = Number(encodedType);
  const encodedStatusType =
    Number.isInteger(parsedType) && parsedType >= 1 && parsedType <= 6
      ? parsedType
      : undefined;
  return {
    pipelineId:
      status?.pipelineId ||
      encodedPipelineId ||
      draft.pipelineId ||
      routePipelineId,
    statusType: status?.type ?? encodedStatusType ?? draft.statusType ?? 1,
  };
};

/** Offers a return to the status creation form from draft Activity. */
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

/** Shows a query error or missing-record message for a ticket status. */
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

/** Loads the scoped status list and opens the selected status's edit form. */
const ExistingTicketStatusEditor = ({
  contentId,
  statusType,
  onClose,
}: {
  contentId: string;
  statusType: number;
  onClose: () => void;
}) => {
  const { statuses, loading, error } = useGetTicketStatus(statusType);
  const status = statuses?.find((item) => item._id === contentId);
  if (loading && !status) return <Spinner containerClassName="py-12" />;
  if (!status) return <TicketStatusUnavailable error={error} />;
  return (
    <StatusPanelForm
      editingStatus={status}
      statusType={statusType}
      onClose={onClose}
    />
  );
};

/** Resolves ticket status scope and renders its requested panel view. */
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
  /** Returns to the previous stacked record or closes the panel. */
  const onClose = () => (canGoBack ? back() : close());
  const { pipelineId, statusType } = getTicketStatusPanelScope(
    status,
    encodedPipelineId,
    encodedType,
    draft,
    routePipelineId,
  );
  const panelScope = useMemo(() => ({ pipelineId }), [pipelineId]);
  if (view === 'title') return status?.name || t('status', 'Status');
  if (view === 'actions') return null;
  if (!isNew && loading && !status)
    return <Spinner containerClassName="py-12" />;
  if ((!isNew && !status) || !pipelineId)
    return <TicketStatusUnavailable error={error} />;
  if (view === 'activity')
    return isNew ? (
      <StatusDraftActivity />
    ) : (
      <ActivityLogs targetId={contentId} showInternalNotes={false} />
    );
  return (
    <SettingsPanelContext.Provider value={panelScope}>
      <SettingsPanelForm>
        {isNew ? (
          <StatusPanelForm
            key={contentId}
            statusType={statusType}
            onClose={onClose}
          />
        ) : (
          <ExistingTicketStatusEditor
            key={contentId}
            contentId={contentId}
            statusType={statusType}
            onClose={onClose}
          />
        )}
      </SettingsPanelForm>
    </SettingsPanelContext.Provider>
  );
};
