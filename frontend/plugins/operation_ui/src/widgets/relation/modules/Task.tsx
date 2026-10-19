import { AddTriageSheet } from '@/triage/components/add-triage/AddTriageSheet';
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
import { TaskWidget } from './TaskWidget';
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
  const { relatedIds, loading: loadingRelations } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'operation:task',
    },
  });

  const { relateRecord } = useRelateRecord({
    contentType,
    contentId,
    relatedContentType: 'operation:task',
    customerId,
    companyId,
    customerIds,
    companyIds,
  });

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
        <AddTriageSheet onComplete={relateRecord} />
      </RelationWidgetEmptyState>
    );
  }

  return (
    <RelationWidgetList
      label={t('tasks-and-triages')}
      actions={<AddTriageSheet onComplete={relateRecord} />}
    >
      {relatedIds.map((taskId) => (
        <TaskWidget key={taskId} taskId={taskId} />
      ))}
      {contactRecords.relatedIds.length > 0 && (
        <RelationWidgetContactsSection>
          {contactRecords.relatedIds.map((taskId) => (
            <TaskWidget key={taskId} taskId={taskId} />
          ))}
        </RelationWidgetContactsSection>
      )}
    </RelationWidgetList>
  );
};
