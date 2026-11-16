import { useCreateProjectRecord } from '@/project/hooks/useCreateProjectRecord';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import {
  SidePanelRecordPathContext,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';
import { ConnectProjectPanel } from './ConnectProjectPanel';
import { PROJECT_CONNECTION_CONTENT_TYPE } from './projectContactConnection';

export const ProjectConnectionPanel = () => {
  const { t } = useTranslation('operation');
  const draft = useSidePanelDraft<{ customerId: string; companyId: string }>(
    PROJECT_CONNECTION_CONTENT_TYPE,
  );
  const { back, canGoBack, close, dismissPath } = useSidePanel();
  const sourcePath = useContext(SidePanelRecordPathContext);
  const { openProjectDraft } = useCreateProjectRecord();
  const cancel = canGoBack ? back : close;
  const contacts = {
    ...(typeof draft.customerId === 'string' && draft.customerId
      ? { customerId: draft.customerId }
      : {}),
    ...(typeof draft.companyId === 'string' && draft.companyId
      ? { companyId: draft.companyId }
      : {}),
  };
  if (!contacts.customerId && !contacts.companyId) {
    return (
      <div className="space-y-3 p-4 text-sm">
        <p className="text-muted-foreground">
          {t(
            'project-connection-contact-required',
            'Open a customer or company to connect a project.',
          )}
        </p>
        <Button variant="secondary" onClick={cancel}>
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    );
  }
  return (
    <ConnectProjectPanel
      contacts={contacts}
      onClose={cancel}
      onConnected={() => {
        if (sourcePath) dismissPath(sourcePath);
        else cancel();
      }}
      onCreate={() => openProjectDraft(contacts, { replace: true })}
    />
  );
};
