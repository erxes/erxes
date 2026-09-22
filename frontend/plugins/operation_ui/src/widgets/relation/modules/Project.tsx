import { GET_PROJECTS } from '@/project/graphql/queries/getProjects';
import { IProject } from '@/project/types';
import { IconClipboard } from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import { ScrollArea, Separator, Spinner } from 'erxes-ui';
import { useCreateMultipleRelations, useRelations } from 'ui-modules';
import { AddProjectRelation } from './AddProjectRelation';
import { ProjectWidgetCard } from './ProjectWidgetCard';
import { useTranslation } from 'react-i18next';

export const Project = ({
  contentId,
  contentType,
  customerId,
  companyId,
}: {
  contentId: string;
  contentType: string;
  customerId?: string;
  companyId?: string;
}) => {
  const { t } = useTranslation('operation');
  const { ownEntities, loading: loadingRelations } = useRelations({
    variables: {
      contentId,
      contentType,
      relatedContentType: 'operation:project',
    },
  });

  const projectIds = ownEntities.map((e) => e.contentId);

  const { data, loading: loadingProjects } = useQuery(GET_PROJECTS, {
    variables: { filter: { _ids: projectIds, limit: projectIds.length || 1 } },
    skip: projectIds.length === 0,
  });

  const { createMultipleRelations } = useCreateMultipleRelations();

  const loading = loadingRelations || (projectIds.length > 0 && loadingProjects);

  if (loading) {
    return <Spinner containerClassName="py-20" />;
  }

  const onSelect = (projectId: string) => {
    const createRelation = (ct: string, cid: string) => ({
      entities: [
        { contentType: ct, contentId: cid },
        { contentType: 'operation:project', contentId: projectId },
      ],
    });

    const seen = new Set<string>();

    const relations = [
      [contentType, contentId],
      ...(customerId ? [['core:customer', customerId]] : []),
      ...(companyId ? [['core:company', companyId]] : []),
    ]
      .filter(([ct, cid]) => {
        const key = `${ct}:${cid}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map(([ct, cid]) => createRelation(ct, cid));

    createMultipleRelations(relations);
  };

  const projects: IProject[] = data?.getProjects?.list ?? [];

  if (ownEntities.length === 0 || projects.length === 0) {
    return (
      <div className="flex flex-auto flex-col gap-4 justify-center items-center text-muted-foreground">
        <div className="border border-dashed p-6 bg-background rounded-xl">
          <IconClipboard />
        </div>
        <span className="text-sm">{t('no-projects-to-display')}</span>
        <AddProjectRelation onSelect={onSelect} label="Add project" />
      </div>
    );
  }

  return (
    <>
      <div className="h-11 px-4 flex items-center gap-2 flex-none bg-background justify-between">
        <span className="font-medium text-primary">{t('projects')}</span>
        <AddProjectRelation onSelect={onSelect} />
      </div>
      <Separator />
      <ScrollArea className="flex-auto">
        <div className="flex flex-col gap-4 p-4">
          {projects.map((project) => (
            <ProjectWidgetCard key={project._id} project={project} />
          ))}
        </div>
      </ScrollArea>
    </>
  );
};
