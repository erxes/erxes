import { compactList, mergeCursorList } from '@/operation/utils/cursorList';
import { IProject } from '@/project/types';
import { GET_TASKS } from '@/task/graphql/queries/getTasks';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { useQuery, useSubscription } from '@apollo/client';
import { Button, EnumCursorDirection, Spinner, toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useWidgetRelations } from '../hooks/useWidgetRelations';
import { TaskWidget } from './TaskWidget';
import { TaskWidgetCard } from './TaskWidgetCard';
import { WidgetQueryError } from './WidgetQueryError';

export const ProjectTasks = ({
  project,
  directIds,
}: {
  project: IProject;
  directIds: string[];
}) => {
  const { t } = useTranslation('operation');
  const filter = { projectId: project._id, cursor: '', limit: 30 };
  const { data, loading, error, refetch, fetchMore } = useQuery(GET_TASKS, {
    variables: { filter },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
  });
  const relations = useWidgetRelations({
    contentId: project._id,
    contentType: 'operation:project',
    relatedContentType: 'operation:task',
  });
  const tasks = compactList(data?.getTasks?.list);
  const listedIds = new Set([...directIds, ...tasks.map((task) => task._id)]);
  const relatedIds = relations.ids.filter((id) => !listedIds.has(id));
  const visibleTasks = tasks.filter((task) => !directIds.includes(task._id));

  useSubscription(TASK_LIST_CHANGED, {
    ignoreResults: true,
    onData: ({ data: event }) => {
      const task = event.data?.operationTaskListChanged?.task;
      if (
        task &&
        (task.projectId === project._id ||
          tasks.some((item) => item._id === task._id))
      ) {
        void refetch().catch(() => undefined);
      }
    },
  });

  const loadMore = () => {
    const pageInfo = data?.getTasks?.pageInfo;
    if (loading || !pageInfo?.hasNextPage || !pageInfo.endCursor) return;
    void fetchMore({
      variables: {
        filter: { ...filter, cursor: pageInfo.endCursor, direction: 'forward' },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!prev.getTasks || !fetchMoreResult.getTasks) return prev;
        return {
          ...prev,
          getTasks: mergeCursorList(
            EnumCursorDirection.FORWARD,
            prev.getTasks,
            fetchMoreResult.getTasks,
          ),
        };
      },
    }).catch((error: unknown) => {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    });
  };

  return (
    <section className="space-y-3" aria-label={project.name}>
      <h4 className="font-medium text-sm truncate">{project.name}</h4>
      {error && <WidgetQueryError error={error} onRetry={refetch} />}
      {relations.error && (
        <WidgetQueryError error={relations.error} onRetry={relations.refetch} />
      )}
      {(loading && !data) || relations.loading ? (
        <Spinner containerClassName="py-6" />
      ) : (
        <>
          {visibleTasks.map((task) => (
            <TaskWidgetCard key={task._id} task={task} />
          ))}
          {relatedIds.map((id) => (
            <TaskWidget key={id} taskId={id} />
          ))}
          {!error &&
            !relations.error &&
            visibleTasks.length === 0 &&
            relatedIds.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {t('no-additional-project-work', {
                  defaultValue: 'No additional tasks or triages to display.',
                })}
              </p>
            )}
        </>
      )}
      {data?.getTasks?.pageInfo?.hasNextPage && (
        <Button variant="secondary" disabled={loading} onClick={loadMore}>
          {t('load-more', { defaultValue: 'Load more' })}
        </Button>
      )}
    </section>
  );
};
