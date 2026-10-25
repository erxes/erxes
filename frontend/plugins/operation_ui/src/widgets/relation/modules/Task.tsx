import { compactList } from '@/operation/utils/cursorList';
import { GET_TASKS } from '@/task/graphql/queries/getTasks';
import { AddTriageButton } from '@/triage/components/add-triage/AddTriageButton';
import { GET_TRIAGES } from '@/triage/graphql/queries/getTriages';
import { useQuery } from '@apollo/client';
import { IconCaretLeftRight } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui';
import {
  getHostContacts,
  IRelationWidgetProps,
  RelationWidgetEmptyState,
  RelationWidgetList,
} from 'ui-modules';
import { TaskItemRow, TriageRow } from '~/widgets/rows/TaskRow';
import { useTranslation } from 'react-i18next';

// The most records listed for one customer or company.
const CONTACT_RECORDS_LIMIT = 50;

/**
 * The tasks and triages of the host's customer and company, found by the
 * contact on the records themselves. "+" files a triage for them (its create
 * mutation saves the contact); accepted, it becomes a task that keeps it.
 */
export const Task = ({
  contentId,
  contentType,
  customerId,
  companyId,
  customerIds,
  companyIds,
}: Omit<IRelationWidgetProps, 'module' | 'pluginName'>) => {
  const { t } = useTranslation('operation');
  const contacts = getHostContacts({
    contentType,
    contentId,
    customerId,
    companyId,
    customerIds,
    companyIds,
  });
  const byCustomer = {
    variables: {
      filter: { customerId: contacts.customerId, limit: CONTACT_RECORDS_LIMIT },
    },
    skip: !contacts.customerId,
  };
  const byCompany = {
    variables: {
      filter: { companyId: contacts.companyId, limit: CONTACT_RECORDS_LIMIT },
    },
    skip: !contacts.companyId,
  };
  const customerTasks = useQuery(GET_TASKS, byCustomer);
  const companyTasks = useQuery(GET_TASKS, byCompany);
  const customerTriages = useQuery(GET_TRIAGES, byCustomer);
  const companyTriages = useQuery(GET_TRIAGES, byCompany);

  if (
    customerTasks.loading ||
    companyTasks.loading ||
    customerTriages.loading ||
    companyTriages.loading
  ) {
    return <Spinner containerClassName="py-20" />;
  }

  // Each record once, the host itself left out.
  const notHost = <T extends { _id: string }>(records: T[]) => [
    ...new Map(
      records
        .filter((record) => record._id !== contentId)
        .map((record) => [record._id, record]),
    ).values(),
  ];
  const triages = notHost([
    ...compactList(customerTriages.data?.operationGetTriageList?.list),
    ...compactList(companyTriages.data?.operationGetTriageList?.list),
  ]);
  // An accepted triage's task keeps its id: list it once, as the triage.
  const triageIds = new Set(triages.map((triage) => triage._id));
  const tasks = notHost([
    ...compactList(customerTasks.data?.getTasks?.list),
    ...compactList(companyTasks.data?.getTasks?.list),
  ]).filter((task) => !triageIds.has(task._id));

  if (triages.length === 0 && tasks.length === 0) {
    return (
      <RelationWidgetEmptyState
        icon={IconCaretLeftRight}
        message={t('no-triages-to-display')}
      >
        <AddTriageButton contacts={contacts} />
      </RelationWidgetEmptyState>
    );
  }

  return (
    <RelationWidgetList
      dense
      label={t('tasks-and-triages', 'Tasks & triages')}
      actions={<AddTriageButton contacts={contacts} iconOnly />}
    >
      {triages.map((triage) => (
        <TriageRow key={triage._id} triage={triage} />
      ))}
      {tasks.map((task) => (
        <TaskItemRow key={task._id} task={task} />
      ))}
    </RelationWidgetList>
  );
};
