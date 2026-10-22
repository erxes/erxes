import { AddTriageButton } from '@/triage/components/add-triage/AddTriageButton';
import { TRIAGE_CONTENT_TYPE } from '@/triage/constants';
import { IconCaretLeftRight } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui';
import {
  IRelationWidgetProps,
  RelationWidgetContactsSection,
  RelationWidgetEmptyState,
  RelationWidgetList,
  useContactRelations,
  useRelateRecord,
  useRelations,
} from 'ui-modules';
import { TaskRow } from '~/widgets/rows/TaskRow';
import { useTranslation } from 'react-i18next';

export const Task = ({
  contentId,
  contentType,
  customerId,
  companyId,
  customerIds,
  companyIds,
}: Omit<IRelationWidgetProps, 'module' | 'pluginName'>) => {
  const { t } = useTranslation('operation');
  const tasks = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'operation:task',
    },
  });
  const triages = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: TRIAGE_CONTENT_TYPE,
    },
  });
  // An accepted triage's task keeps its id: list each id once.
  const relatedIds = [...new Set([...triages.relatedIds, ...tasks.relatedIds])];
  const loadingRelations = tasks.loading || triages.loading;

  // New triages are linked to the host's contacts by their create mutation,
  // and to the host itself when it is not a contact; accepted, the task
  // keeps the links.
  const { contacts } = useRelateRecord({
    contentType,
    contentId,
    relatedContentType: TRIAGE_CONTENT_TYPE,
    customerId,
    companyId,
    customerIds,
    companyIds,
  });

  const host =
    contentType === 'core:customer' || contentType === 'core:company'
      ? undefined
      : { contentType, contentId };

  const contactRecords = useContactRelations({
    contentType,
    contentId,
    relatedContentType: 'operation:task',
    customerId,
    companyId,
    customerIds,
    companyIds,
    excludeIds: relatedIds,
  });

  if (loadingRelations || contactRecords.loading) {
    return <Spinner containerClassName="py-20" />;
  }

  if (relatedIds.length === 0 && contactRecords.relatedIds.length === 0) {
    return (
      <RelationWidgetEmptyState
        icon={IconCaretLeftRight}
        message={t('no-triages-to-display')}
      >
        <AddTriageButton contacts={contacts} host={host} />
      </RelationWidgetEmptyState>
    );
  }

  return (
    <RelationWidgetList
      dense
      label={t('tasks-and-triages', 'Tasks & triages')}
      actions={
        <AddTriageButton contacts={contacts} host={host} iconOnly />
      }
    >
      {relatedIds.map((taskId) => (
        <TaskRow key={taskId} taskId={taskId} />
      ))}
      {contactRecords.relatedIds.length > 0 && (
        <RelationWidgetContactsSection dense>
          {contactRecords.relatedIds.map((taskId) => (
            <TaskRow key={taskId} taskId={taskId} />
          ))}
        </RelationWidgetContactsSection>
      )}
    </RelationWidgetList>
  );
};
