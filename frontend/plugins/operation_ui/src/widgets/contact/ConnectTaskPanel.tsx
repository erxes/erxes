import { ContactConnectionPicker } from './ContactConnectionPicker';
import { compactList } from '@/operation/utils/cursorList';
import { UPDATE_TASK_MUTATION } from '@/task/graphql/mutations/updateTask';
import { GET_TASK } from '@/task/graphql/queries/getTask';
import { GET_TASKS } from '@/task/graphql/queries/getTasks';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { IconChecklist } from '@tabler/icons-react';
import { Combobox, Command, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import {
  getTaskContactUpdate,
  CONTACT_TASK_RECORDS_LIMIT,
  withConnectedTask,
} from './taskContactConnection';
import { gql } from '~/gql';
import { mergeTaskCandidatePages } from './taskCandidatePagination';
import { useContactConnection } from './useContactConnection';

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

  const { connecting, connect: connectTask } = useContactConnection({
    loadRecord: async (taskId: string) => {
      const { data: fresh } = await client.query({
        query: GET_TASK,
        variables: { _id: taskId },
        fetchPolicy: 'network-only',
      });
      return fresh.getTask;
    },
    getUpdate: (task) => getTaskContactUpdate(task, contact),
    save: async (task, variables) => {
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
      return result.data?.updateTask;
    },
    refreshLists: (task, saved) =>
      Promise.all([
        client.refetchQueries({
          include: 'active',
          onQueryUpdated: (query) => query.queryName === 'GetTasks',
        }),
        client
          .query({ ...contactQuery, fetchPolicy: 'network-only' })
          .then(({ data: page }) => {
            const next = withConnectedTask(page, { ...task, ...saved }, false);
            if (next) client.writeQuery({ ...contactQuery, data: next });
          }),
      ]),
    reloadCandidates: refetch,
    onConnected: onClose,
    messages: {
      cannotConnectTitle: t('task-cannot-connect', 'Task cannot be connected'),
      cannotConnectDescription: t(
        'task-contact-already-set',
        'This task is unavailable or already has this contact field set. Choose a task with an empty contact field.',
      ),
      failed: t('task-connect-failed', 'Could not connect task'),
      connected: t('task-connected', 'Task connected'),
      refreshFailed: t(
        'task-connected-refresh-failed',
        'Some task lists could not be refreshed.',
      ),
    },
  });

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
    <ContactConnectionPicker
      labels={{
        title: t('connect-task', 'Connect task'),
        help:
          contentType === 'core:company'
            ? t(
                'connect-task-company-help',
                'Choose a task without a company. Tasks that already have a company cannot be selected.',
              )
            : t(
                'connect-task-customer-help',
                'Choose a task without a customer. Tasks that already have a customer cannot be selected.',
              ),
        search: t('search-tasks', 'Search tasks...'),
        list: t('existing-tasks', 'Existing tasks'),
        connecting: t('connecting-task', 'Connecting task...'),
        create: t('create-triage', 'Create triage'),
      }}
      search={search}
      onSearchChange={setSearch}
      loading={loading}
      connecting={connecting}
      error={error}
      onRetry={() => void refetch().catch(() => undefined)}
      onClose={onClose}
      onCreate={onCreateTriage}
    >
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
    </ContactConnectionPicker>
  );
};
