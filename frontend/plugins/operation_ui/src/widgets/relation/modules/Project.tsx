import { IconClipboard } from '@tabler/icons-react';
import { ScrollArea, Separator, Spinner } from 'erxes-ui';
import { useCreateWidgetRelations } from '../hooks/useCreateWidgetRelations';
import { useConnectedProjects } from '../hooks/useConnectedProjects';
import { AddProjectRelation } from './AddProjectRelation';
import { ConnectProjectRelation } from './ConnectProjectRelation';
import { ProjectWidgetCard } from './ProjectWidgetCard';
import { WidgetQueryError } from './WidgetQueryError';
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
  const { projectIds, projects, loading, error, retry } = useConnectedProjects({
    contentId,
    contentType,
  });

  const { createRelations, loading: connecting } = useCreateWidgetRelations({
    contentId,
    contentType,
    customerId,
    companyId,
    relatedContentType: 'operation:project',
    successMessage: t('project-connected', {
      defaultValue: 'Project connected successfully',
    }),
  });

  if (loading) {
    return <Spinner containerClassName="py-20" />;
  }
  if (error) return <WidgetQueryError error={error} onRetry={retry} />;

  const onSelect = async (projectId: string): Promise<boolean> => {
    if (connecting || projectIds.includes(projectId)) return false;
    return createRelations(projectId);
  };

  if (projects.length === 0) {
    return (
      <div className="flex flex-auto flex-col gap-4 justify-center items-center text-muted-foreground">
        <div className="border border-dashed p-6 bg-background rounded-xl">
          <IconClipboard />
        </div>
        <span className="text-sm">{t('no-projects-to-display')}</span>
        <AddProjectRelation
          onSelect={onSelect}
          label={t('add-project')}
          disabled={connecting}
        />
        <ConnectProjectRelation
          projectIds={projectIds}
          onSelect={onSelect}
          disabled={connecting}
          showText
        />
      </div>
    );
  }

  return (
    <>
      <div className="h-11 px-4 flex items-center gap-2 flex-none bg-background justify-between">
        <span className="font-medium text-primary">{t('projects')}</span>
        <div className="flex items-center gap-2">
          <AddProjectRelation onSelect={onSelect} disabled={connecting} />
          <ConnectProjectRelation
            projectIds={projectIds}
            onSelect={onSelect}
            disabled={connecting}
          />
        </div>
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
