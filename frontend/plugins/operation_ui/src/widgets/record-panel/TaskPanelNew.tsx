import { TASK_CONTENT_TYPE } from '@/task/constants';
import {
  TTaskDraft,
  useCreateTaskRecord,
} from '@/task/hooks/useCreateTaskRecord';
import { useTranslation } from 'react-i18next';
import { PanelDraftFields, useSidePanelDraft } from 'ui-modules';
import { DraftContext } from './DraftContext';

// A task not created yet: created once named, with what the draft started
// with (team, project, status, the customer it is for, ...).
export const TaskPanelNew = () => {
  const { t } = useTranslation('operation');
  const draft = useSidePanelDraft<TTaskDraft>(TASK_CONTENT_TYPE);
  const { createTaskRecord, loading } = useCreateTaskRecord();

  return (
    <PanelDraftFields
      scope="side-panel-task-new"
      creating={loading}
      fields={[{ name: 'name', label: t('name', 'Name') }]}
      onCreate={({ name }) =>
        name && createTaskRecord({ ...draft, name }, { replace: true })
      }
    >
      <DraftContext
        teamId={draft.teamId}
        customerIds={draft.customerIds}
        companyIds={draft.companyIds}
      />
    </PanelDraftFields>
  );
};
