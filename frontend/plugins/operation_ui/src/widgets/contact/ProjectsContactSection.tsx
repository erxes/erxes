import { useCreateProjectRecord } from '@/project/hooks/useCreateProjectRecord';
import { IconClipboard } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { compactList } from '@/operation/utils/cursorList';
import { GET_PROJECTS } from '@/project/graphql/queries/getProjects';
import { IProject } from '@/project/types';
import { useQuery } from '@apollo/client';
import { ContactWidgetSection, IContactWidgetProps } from 'ui-modules';
import { ProjectRow } from '~/widgets/rows/ProjectRow';

// The most projects listed for one contact.
const CONTACT_RECORDS_LIMIT = 50;

// A customer's or company's projects, found by the contact on the projects
// themselves; "+" creates one for them.
export const ProjectsContactSection = ({
  contentType,
  contentId,
}: Omit<IContactWidgetProps, 'module'>) => {
  const { t } = useTranslation('operation');
  const { openProjectDraft } = useCreateProjectRecord();
  const contacts =
    contentType === 'core:company'
      ? { companyId: contentId }
      : { customerId: contentId };
  const { data, loading } = useQuery(GET_PROJECTS, {
    variables: { filter: { ...contacts, limit: CONTACT_RECORDS_LIMIT } },
  });
  const projectsById = new Map<string, IProject>(
    compactList(data?.getProjects?.list).map((project: IProject) => [
      project._id,
      project,
    ]),
  );

  return (
    <ContactWidgetSection
      icon={IconClipboard}
      label={t('projects', 'Projects')}
      ids={[...projectsById.keys()]}
      loading={loading}
      createLabel={t('add-project', 'Add project')}
      onCreate={() => openProjectDraft(contacts, { stack: true })}
      renderItem={(projectId) => {
        const project = projectsById.get(projectId);
        return project ? <ProjectRow project={project} /> : null;
      }}
    />
  );
};
