import { compactList } from '@/operation/utils/cursorList';
import { GET_TASKS } from '@/task/graphql/queries/getTasks';
import { GET_TRIAGES } from '@/triage/graphql/queries/getTriages';
import { useQuery } from '@apollo/client';
import { IconChecklist } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { TaskItemRow, TriageRow } from '~/widgets/rows/TaskRow';
import {
  ContactWidgetSection,
  IContactWidgetProps,
  useSidePanel,
} from 'ui-modules';
import {
  CONTACT_TASK_RECORDS_LIMIT,
  TASK_CONNECTION_CONTENT_TYPE,
} from './taskContactConnection';

export const TasksContactSection = ({
  contentType,
  contentId,
}: Omit<IContactWidgetProps, 'module'>) => {
  const { t } = useTranslation('operation');
  const { openNewRecord } = useSidePanel();
  const contacts =
    contentType === 'core:company'
      ? { companyId: contentId }
      : { customerId: contentId };
  const tasksQuery = useQuery(GET_TASKS, {
    variables: { filter: { ...contacts, limit: CONTACT_TASK_RECORDS_LIMIT } },
  });
  const triagesQuery = useQuery(GET_TRIAGES, {
    variables: { filter: { ...contacts, limit: CONTACT_TASK_RECORDS_LIMIT } },
  });

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
      createLabel={t('connect-task', 'Connect task')}
      onCreate={() =>
        openNewRecord(
          TASK_CONNECTION_CONTENT_TYPE,
          { contentType, contentId },
          { stack: true },
        )
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
