import { compactList } from '@/operation/utils/cursorList';
import { UPDATE_TASK_MUTATION } from '@/task/graphql/mutations/updateTask';
import { GET_TASK } from '@/task/graphql/queries/getTask';
import { GET_TASKS } from '@/task/graphql/queries/getTasks';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { IconChecklist, IconPlus } from '@tabler/icons-react';
import { Button, Combobox, Command, useToast } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import {
  finishTaskContactConnection,
  getTaskContactUpdate,
  CONTACT_TASK_RECORDS_LIMIT,
  withConnectedTask,
} from './taskContactConnection';
import { gql } from '~/gql';
import { mergeTaskCandidatePages } from './taskCandidatePagination';

const PAGE_SIZE = 30;

const OPERATION_CONTACT_TASK_CANDIDATES = gql(`
  query operationContactTaskCandidates($filter: ITaskFilter) {
    getTasks(filter: $filter) {
      list {
        _id
        name
        customerId
        companyId
      }
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export const ConnectTaskPanel = ({
  contentType,
  contentId,
  onClose,
  onCreateTriage,
}: {
  contentType: string;
  contentId: string;
  onClose: () => void;
  onCreateTriage?: () => void;
}) => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const client = useApolloClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [connecting, setConnecting] = useState(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [updateTask] = useMutation(UPDATE_TASK_MUTATION);
  const { data, loading, error, fetchMore, refetch, observable } = useQuery(
    OPERATION_CONTACT_TASK_CANDIDATES,
    {
      variables: { filter: { name: debouncedSearch, limit: PAGE_SIZE } },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );
  const tasks = compactList(data?.getTasks?.list);
  const pageInfo = data?.getTasks?.pageInfo;
  const contact = { contentType, contentId };
  const contactKey =
    contentType === 'core:company' ? 'companyId' : 'customerId';

  const contactQuery = {
    query: GET_TASKS,
    variables: {
      filter: { [contactKey]: contentId, limit: CONTACT_TASK_RECORDS_LIMIT },
    },
  };

  const connectTask = async (taskId: string) => {
    if (connecting) return;
    setConnecting(true);

    try {
      const { data: fresh } = await client.query({
        query: GET_TASK,
        variables: { _id: taskId },
        fetchPolicy: 'network-only',
      });
      const task = fresh.getTask;
      const variables = task && getTaskContactUpdate(task, contact);
      if (!task || !variables) {
        toast({
          title: t('task-cannot-connect', 'Task cannot be connected'),
          description: t(
            'task-contact-already-set',
            'This task is unavailable or already has this contact field set. Choose a task with an empty contact field.',
          ),
          variant: 'destructive',
        });
        await refetch();
        return;
      }

      const result = await updateTask({
        variables,
        update: (cache, { data: updated }) => {
          const previous = cache.readQuery(contactQuery);
          cache.evict({ id: 'ROOT_QUERY', fieldName: 'getTasks' });

          const next =
            updated?.updateTask &&
            withConnectedTask(previous, {
              ...task,
              ...updated.updateTask,
            });
          if (next) cache.writeQuery({ ...contactQuery, data: next });
        },
      });
      const saved = result.data?.updateTask;
      if (!saved)
        throw new Error(t('task-connect-failed', 'Could not connect task'));

      const refreshed = await finishTaskContactConnection(
        () =>
          Promise.all([
            client.refetchQueries({
              include: 'active',
              onQueryUpdated: (query) => query.queryName === 'GetTasks',
            }),

            client
              .query({ ...contactQuery, fetchPolicy: 'network-only' })
              .then(({ data: page }) => {
                const next = withConnectedTask(
                  page,
                  { ...task, ...saved },
                  false,
                );
                if (next) client.writeQuery({ ...contactQuery, data: next });
              }),
          ]),
        () => {
          if (mounted.current) onClose();
        },
      );
      toast({
        title: t('task-connected', 'Task connected'),
        description: refreshed
          ? undefined
          : t(
              'task-connected-refresh-failed',
              'Some task lists could not be refreshed.',
            ),
      });
    } catch (connectionError) {
      toast({
        title: t('task-connect-failed', 'Could not connect task'),
        description:
          connectionError instanceof Error
            ? connectionError.message
            : undefined,
        variant: 'destructive',
      });
    } finally {
      if (mounted.current) setConnecting(false);
    }
  };

  const loadMore = () => {
    if (
      loading ||
      connecting ||
      search !== debouncedSearch ||
      !pageInfo?.hasNextPage ||
      !pageInfo.endCursor
    )
      return;
    void fetchMore({
      variables: {
        filter: {
          name: debouncedSearch,
          limit: PAGE_SIZE,
          cursor: pageInfo.endCursor,
          direction: 'forward',
        },
      },
      updateQuery: (previous, { fetchMoreResult }) =>
        mergeTaskCandidatePages(
          previous,
          fetchMoreResult,
          debouncedSearch,
          observable.variables?.filter?.name,
        ),
    }).catch((fetchError: unknown) => {
      toast({
        title: t('task-load-more-failed', 'Could not load more tasks'),
        description:
          fetchError instanceof Error ? fetchError.message : undefined,
        variant: 'destructive',
      });
    });
  };

  return (
    <section
      aria-label={t('connect-task', 'Connect task')}
      className="flex min-h-0 min-w-0 flex-1 flex-col bg-background"
    >
      <div className="px-3 py-3">
        <p className="text-xs text-muted-foreground">
          {contentType === 'core:company'
            ? t(
                'connect-task-company-help',
                'Choose a task without a company. Tasks that already have a company cannot be selected.',
              )
            : t(
                'connect-task-customer-help',
                'Choose a task without a customer. Tasks that already have a customer cannot be selected.',
              )}
        </p>
      </div>
      <Command shouldFilter={false} className="min-h-0 flex-1 rounded-none">
        <div className="flex items-center gap-2 border-b pr-3">
          <Command.Input
            variant="primary"
            wrapperClassName="min-w-0 flex-1 border-0"
            placeholder={t('search-tasks', 'Search tasks...')}
            aria-label={t('search-tasks', 'Search tasks...')}
            value={search}
            onValueChange={setSearch}
            disabled={connecting}
            focusOnMount
          />
          {onCreateTriage && (
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              disabled={connecting}
              onClick={onCreateTriage}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.stopPropagation();
              }}
            >
              <IconPlus className="size-4" />
              {t('create-triage', 'Create triage')}
            </Button>
          )}
        </div>
        <Command.List
          aria-label={t('existing-tasks', 'Existing tasks')}
          className="max-h-none flex-1"
        >
          {error ? (
            <div role="alert" className="p-4 text-sm text-muted-foreground">
              <p>{error.message}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void refetch().catch(() => undefined)}
              >
                {t('retry', 'Retry')}
              </Button>
            </div>
          ) : (
            <>
              <Combobox.Empty loading={loading} />
              {tasks.map((task) => (
                <Command.Item
                  key={task._id}
                  value={task._id}
                  disabled={
                    connecting ||
                    loading ||
                    search !== debouncedSearch ||
                    !getTaskContactUpdate(task, contact)
                  }
                  onSelect={() => void connectTask(task._id)}
                  className="gap-2"
                >
                  <IconChecklist className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate">
                    {task.name || t('untitled', 'Untitled')}
                  </span>
                  {task[contactKey] && (
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {task[contactKey] === contentId
                        ? t('already-connected', 'Already connected')
                        : t('linked-to-another-contact', 'Linked elsewhere')}
                    </span>
                  )}
                </Command.Item>
              ))}
              {pageInfo?.hasNextPage && (
                <Combobox.FetchMore
                  key={`${debouncedSearch}:${pageInfo.endCursor}`}
                  fetchMore={loadMore}
                  currentLength={tasks.length}
                  totalCount={data?.getTasks?.totalCount ?? 0}
                  disabled
                  aria-label={t('loading-more-tasks', 'Loading more tasks...')}
                />
              )}
            </>
          )}
        </Command.List>
      </Command>
      <div className="flex items-center justify-between border-t p-3">
        {connecting ? (
          <p role="status" className="text-xs text-muted-foreground">
            {t('connecting-task', 'Connecting task...')}
          </p>
        ) : (
          <span />
        )}
        <Button
          variant="secondary"
          size="sm"
          disabled={connecting}
          onClick={onClose}
        >
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    </section>
  );
};
