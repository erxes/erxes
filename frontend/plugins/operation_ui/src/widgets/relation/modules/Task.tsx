import { IconCaretLeftRight } from '@tabler/icons-react';
import { ScrollArea, Separator, Spinner } from 'erxes-ui';
import { useCreateWidgetRelations } from '../hooks/useCreateWidgetRelations';
import { useWidgetRelations } from '../hooks/useWidgetRelations';
import { useConnectedProjects } from '../hooks/useConnectedProjects';
import { AddTaskRelation } from './AddTaskRelation';
import { ProjectTasks } from './ProjectTasks';
import { WidgetQueryError } from './WidgetQueryError';
import { TaskWidget } from './TaskWidget';
import { useTranslation } from 'react-i18next';

export const Task = ({
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
  const direct = useWidgetRelations({
    contentId,
    contentType,
    relatedContentType: 'operation:task',
  });
  const connected = useConnectedProjects({
    contentId,
    contentType,
  });
  const { createRelations: onComplete } = useCreateWidgetRelations({
    contentId,
    contentType,
    customerId,
    companyId,
    relatedContentType: 'operation:task',
    successMessage: t('task-or-triage-connected', {
      defaultValue: 'Record created and connected successfully',
    }),
  });

  if (direct.loading || connected.loading) {
    return <Spinner containerClassName="py-20" />;
  }
  if (direct.error)
    return <WidgetQueryError error={direct.error} onRetry={direct.refetch} />;
  if (connected.error)
    return (
      <WidgetQueryError error={connected.error} onRetry={connected.retry} />
    );
  const projects = connected.projects;
  if (direct.ids.length === 0 && projects.length === 0) {
    return (
      <div className="flex flex-auto flex-col gap-4 justify-center items-center text-muted-foreground">
        <div className="border border-dashed p-6 bg-background rounded-xl">
          <IconCaretLeftRight />
        </div>
        <span className="text-sm">
          {t('no-tasks-or-triages', {
            defaultValue: 'No tasks or triages to display.',
          })}
        </span>
        <AddTaskRelation onComplete={onComplete} showText />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-0 min-w-full flex-auto flex-col">
      <div className="h-11 px-4 flex items-center justify-between gap-2 flex-none bg-background">
        <span className="font-medium text-primary truncate">
          {t('tasks-and-triages')}
        </span>
        <AddTaskRelation onComplete={onComplete} />
      </div>
      <Separator />
      <ScrollArea
        className="min-h-0 min-w-0 flex-auto"
        viewportClassName="[&>div]:!block"
      >
        <div className="flex min-w-0 flex-col gap-6 p-4">
          {direct.ids.length > 0 && (
            <section className="space-y-3">
              <h4 className="text-sm font-medium">
                {t('directly-linked', { defaultValue: 'Directly linked' })}
              </h4>
              {direct.ids.map((id) => (
                <TaskWidget key={id} taskId={id} />
              ))}
            </section>
          )}
          {projects.map((project) => (
            <ProjectTasks
              key={project._id}
              project={project}
              directIds={direct.ids}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
