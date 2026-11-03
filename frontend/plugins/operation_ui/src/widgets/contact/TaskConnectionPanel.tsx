import { useCreateTriageRecord } from '@/triage/hooks/useCreateTriageRecord';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useSidePanel, useSidePanelDraft } from 'ui-modules';
import { ConnectTaskPanel } from './ConnectTaskPanel';
import { TASK_CONNECTION_CONTENT_TYPE } from './taskContactConnection';

export const TaskConnectionPanel = () => {
  const { t } = useTranslation('operation');
  const draft = useSidePanelDraft<{
    contentType: string;
    contentId: string;
  }>(TASK_CONNECTION_CONTENT_TYPE);
  const { back, canGoBack, close } = useSidePanel();
  const { openTriageDraft, canCreate } = useCreateTriageRecord();
  const cancel = canGoBack ? back : close;

  if (
    !draft.contentId ||
    (draft.contentType !== 'core:customer' &&
      draft.contentType !== 'core:company')
  ) {
    return (
      <div className="space-y-3 p-4 text-sm">
        <p className="text-muted-foreground">
          {t(
            'task-connection-contact-required',
            'Open a customer or company to connect a task.',
          )}
        </p>
        <Button variant="secondary" onClick={cancel}>
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    );
  }

  const contacts =
    draft.contentType === 'core:company'
      ? { companyId: draft.contentId }
      : { customerId: draft.contentId };

  return (
    <ConnectTaskPanel
      contentType={draft.contentType}
      contentId={draft.contentId}
      onClose={cancel}
      onCreateTriage={
        canCreate
          ? () => openTriageDraft(contacts, { replace: true })
          : undefined
      }
    />
  );
};
