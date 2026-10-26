import { GET_PROJECTS } from '@/project/graphql/queries/getProjects';
import { compactList } from '@/operation/utils/cursorList';
import { IProject } from '@/project/types';
import { IconClipboard } from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import { Spinner } from 'erxes-ui';
import {
  getHostContacts,
  IRelationWidgetProps,
  RelationWidgetEmptyState,
  RelationWidgetList,
} from 'ui-modules';
import { AddProjectRelation } from './AddProjectRelation';
import { ProjectRow } from '~/widgets/rows/ProjectRow';
import { useTranslation } from 'react-i18next';

// The most projects listed for one customer or company.
const CONTACT_RECORDS_LIMIT = 50;

/**
 * The projects of the host's customer and company, found by the contact on
 * the projects themselves; "+" creates one for them (createProject saves the
 * contact).
 */
export const Project = ({
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
  const customerProjects = useQuery(GET_PROJECTS, {
    variables: {
      filter: { customerId: contacts.customerId, limit: CONTACT_RECORDS_LIMIT },
    },
    skip: !contacts.customerId,
  });
  const companyProjects = useQuery(GET_PROJECTS, {
    variables: {
      filter: { companyId: contacts.companyId, limit: CONTACT_RECORDS_LIMIT },
    },
    skip: !contacts.companyId,
  });

  if (customerProjects.loading || companyProjects.loading) {
    return <Spinner containerClassName="py-20" />;
  }

  // Each project once, the host itself left out.
  const projects: IProject[] = [
    ...new Map(
      [
        ...compactList(customerProjects.data?.getProjects?.list),
        ...compactList(companyProjects.data?.getProjects?.list),
      ]
        .filter((project: IProject) => project._id !== contentId)
        .map((project: IProject) => [project._id, project]),
    ).values(),
  ];

  if (projects.length === 0) {
    return (
      <RelationWidgetEmptyState
        icon={IconClipboard}
        message={t('no-projects-to-display')}
      >
        <AddProjectRelation contacts={contacts} label="Add project" />
      </RelationWidgetEmptyState>
    );
  }

  return (
    <RelationWidgetList
      dense
      label={t('projects')}
      actions={<AddProjectRelation contacts={contacts} />}
    >
      {projects.map((project) => (
        <ProjectRow key={project._id} project={project} />
      ))}
    </RelationWidgetList>
  );
};
