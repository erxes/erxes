import { GET_PROJECTS } from '@/project/graphql/queries/getProjects';
import { compactList } from '@/operation/utils/cursorList';
import { IProject } from '@/project/types';
import { IconClipboard } from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
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
import { AddProjectRelation } from './AddProjectRelation';
import { ProjectWidgetCard } from './ProjectWidgetCard';
import { useTranslation } from 'react-i18next';

export const Project = ({
  contentId,
  contentType,
  customerId,
  companyId,
  customerIds,
  companyIds,
}: Omit<IRelationWidgetProps, 'module' | 'pluginName'>) => {
  const { t } = useTranslation('operation');
  const { relatedIds: projectIds, loading: loadingRelations } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'operation:project',
    },
  });

  const contactRecords = useContactRelations({
    contentType,
    contentId,
    relatedContentType: 'operation:project',
    customerId,
    companyId,
    customerIds,
    companyIds,
    excludeIds: projectIds,
  });

  const allProjectIds = [...projectIds, ...contactRecords.relatedIds];

  const { data, loading: loadingProjects } = useQuery(GET_PROJECTS, {
    variables: {
      filter: { _ids: allProjectIds, limit: allProjectIds.length || 1 },
    },
    skip: allProjectIds.length === 0,
  });

  const { relateRecord } = useRelateRecord({
    contentType,
    contentId,
    relatedContentType: 'operation:project',
    customerId,
    companyId,
    customerIds,
    companyIds,
  });

  const loading =
    loadingRelations ||
    contactRecords.loading ||
    (allProjectIds.length > 0 && loadingProjects);

  if (loading) {
    return <Spinner containerClassName="py-20" />;
  }

  const projects: IProject[] = compactList(data?.getProjects?.list);
  const directProjects = projects.filter((project) =>
    projectIds.includes(project._id),
  );
  const contactProjects = projects.filter((project) =>
    contactRecords.relatedIds.includes(project._id),
  );

  if (projects.length === 0) {
    return (
      <RelationWidgetEmptyState
        icon={IconClipboard}
        message={t('no-projects-to-display')}
      >
        <AddProjectRelation onSelect={relateRecord} label="Add project" />
      </RelationWidgetEmptyState>
    );
  }

  return (
    <RelationWidgetList
      label={t('projects')}
      actions={<AddProjectRelation onSelect={relateRecord} />}
    >
      {directProjects.map((project) => (
        <ProjectWidgetCard key={project._id} project={project} />
      ))}
      {contactProjects.length > 0 && (
        <RelationWidgetContactsSection>
          {contactProjects.map((project) => (
            <ProjectWidgetCard key={project._id} project={project} />
          ))}
        </RelationWidgetContactsSection>
      )}
    </RelationWidgetList>
  );
};
