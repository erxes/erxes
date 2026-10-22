import { compactList } from '@/operation/utils/cursorList';
import { GET_TASKS } from '@/task/graphql/queries/getTasks';
import { GET_TRIAGES } from '@/triage/graphql/queries/getTriages';
import { useCreateTriageRecord } from '@/triage/hooks/useCreateTriageRecord';
import { useQuery } from '@apollo/client';
import { IconChecklist } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { TaskItemRow, TriageRow } from '~/widgets/rows/TaskRow';
import { ContactWidgetSection, IContactWidgetProps } from 'ui-modules';

// The most records listed for one contact.
const CONTACT_RECORDS_LIMIT = 50;

/**
 * A customer's or company's tasks and the triages not yet accepted, found by
 * the contact on the records themselves (their customerId / companyId).
 * "+" files a triage for them, only offered while a team has triage on;
 * accepted, it becomes a task that keeps them.
 */
export const TasksContactSection = ({
  contentType,
  contentId,
}: Omit<IContactWidgetProps, 'module'>) => {
  const { t } = useTranslation('operation');
  const contacts =
    contentType === 'core:company'
      ? { companyId: contentId }
      : { customerId: contentId };
  const tasksQuery = useQuery(GET_TASKS, {
    variables: { filter: { ...contacts, limit: CONTACT_RECORDS_LIMIT } },
  });
  const triagesQuery = useQuery(GET_TRIAGES, {
    variables: { filter: { ...contacts, limit: CONTACT_RECORDS_LIMIT } },
  });
  const { openTriageDraft, canCreate: canCreateTriage } =
    useCreateTriageRecord();

  const triages = compactList(triagesQuery.data?.operationGetTriageList?.list);
  const tasks = compactList(tasksQuery.data?.getTasks?.list);
  const triagesById = new Map(triages.map((triage) => [triage._id, triage]));
  const tasksById = new Map(tasks.map((task) => [task._id, task]));


  return (
    <ContactWidgetSection
      icon={IconChecklist}
      label={t('tasks-and-triages', 'Tasks & triages')}
      ids={[...triagesById.keys(), ...tasksById.keys()]}
      loading={tasksQuery.loading || triagesQuery.loading}
      createLabel={t('add-triage')}
      onCreate={
        canCreateTriage
          ? () => openTriageDraft(contacts, { stack: true })
          : undefined
      }
      renderItem={(id) => {
        const triage = triagesById.get(id);
        const task = tasksById.get(id);

        if (triage) {
          return <TriageRow triage={triage} />;
        }

        return task ? <TaskItemRow task={task} /> : null;
      }}
    />
  );
};
