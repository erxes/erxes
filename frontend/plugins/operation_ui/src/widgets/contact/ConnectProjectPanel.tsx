import { compactList } from '@/operation/utils/cursorList';
import { UPDATE_PROJECT_MUTATION } from '@/project/graphql/mutation/updateProject';
import { GET_PROJECT } from '@/project/graphql/queries/getProject';
import { GET_PROJECTS } from '@/project/graphql/queries/getProjects';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { IconClipboard } from '@tabler/icons-react';
import { Combobox, Command, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { gql } from '~/gql';
import { ContactConnectionPicker } from './ContactConnectionPicker';
import {
  type ConnectionContacts,
  getContactConnectionUpdate,
  mergeContactCandidatePages,
} from './contactConnection';
import {
  CONTACT_PROJECT_RECORDS_LIMIT,
  withConnectedProject,
} from './projectContactConnection';
import { useContactConnection } from './useContactConnection';

const PAGE_SIZE = 30;
export const OPERATION_CONTACT_PROJECT_CANDIDATES = gql(`
  query operationContactProjectCandidates($filter: IProjectFilter) {
    getProjects(filter: $filter) {
      list { _id name customerId companyId }
      totalCount
      pageInfo { hasNextPage endCursor }
    }
  }
`);

export const ConnectProjectPanel = ({
  contacts,
  onClose,
  onConnected,
  onCreate,
}: {
  contacts: ConnectionContacts;
  onClose: () => void;
  onConnected: () => void;
  onCreate: () => void;
}) => {
  const { t } = useTranslation('operation');
  const { toast } = useToast();
  const client = useApolloClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const [updateProject] = useMutation(UPDATE_PROJECT_MUTATION);
  const { data, loading, error, refetch, fetchMore, observable } = useQuery(
    OPERATION_CONTACT_PROJECT_CANDIDATES,
    {
      variables: { filter: { name: debouncedSearch, limit: PAGE_SIZE } },
      fetchPolicy: 'network-only',
      notifyOnNetworkStatusChange: true,
    },
  );
  const projects = compactList(data?.getProjects?.list);
  const pageInfo = data?.getProjects?.pageInfo;
  // Contact sections query either field separately; update each affected list.
  const contactQueries = Object.entries(contacts)
    .filter(([, id]) => id)
    .map(([field, id]) => ({
      query: GET_PROJECTS,
      variables: {
        filter: { [field]: id, limit: CONTACT_PROJECT_RECORDS_LIMIT },
      },
    }));

  const { connecting, connect: connectProject } = useContactConnection({
    loadRecord: async (projectId: string) => {
      const { data: fresh } = await client.query({
        query: GET_PROJECT,
        variables: { _id: projectId },
        fetchPolicy: 'network-only',
      });
      return fresh.getProject;
    },
    getUpdate: (project) => getContactConnectionUpdate(project, contacts),
    save: async (project, variables) => {
      const result = await updateProject({
        variables,
        update: (cache, { data: updated }) => {
          const previous = contactQueries.map((query) =>
            cache.readQuery(query),
          );
          cache.evict({ id: 'ROOT_QUERY', fieldName: 'getProjects' });
          if (!updated?.updateProject) return;
          const savedProject = { ...project, ...updated.updateProject };
          contactQueries.forEach((query, index) => {
            const incrementCount = Boolean(
              (variables.customerId &&
                query.variables.filter.customerId === variables.customerId) ||
                (variables.companyId &&
                  query.variables.filter.companyId === variables.companyId),
            );
            const next = withConnectedProject(
              previous[index],
              savedProject,
              incrementCount,
            );
            if (next) cache.writeQuery({ ...query, data: next });
          });
        },
      });
      return result.data?.updateProject;
    },
    refreshLists: (project, saved) =>
      Promise.all([
        client.refetchQueries({
          include: 'active',
          onQueryUpdated: (query) => query.queryName === 'GetProjects',
        }),
        ...contactQueries.map((query) =>
          client
            .query({ ...query, fetchPolicy: 'network-only' })
            .then(({ data: page }) => {
              const next = withConnectedProject(
                page,
                { ...project, ...saved },
                false,
              );
              if (next) client.writeQuery({ ...query, data: next });
            }),
        ),
      ]),
    reloadCandidates: refetch,
    onConnected,
    messages: {
      cannotConnectTitle: t(
        'project-cannot-connect',
        'Project cannot be connected',
      ),
      cannotConnectDescription: t(
        'project-contact-already-set',
        'This project is unavailable or its contact fields are already set. Choose a project with empty contact fields.',
      ),
      failed: t('project-connect-failed', 'Could not connect project'),
      connected: t('project-connected', 'Project connected'),
      refreshFailed: t(
        'project-connected-refresh-failed',
        'Some project lists could not be refreshed.',
      ),
    },
  });

  const loadMore = (): void => {
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
      updateQuery: (previous, { fetchMoreResult }) => {
        if (!previous.getProjects || !fetchMoreResult.getProjects)
          return previous;
        return {
          ...previous,
          getProjects: mergeContactCandidatePages(
            previous.getProjects,
            fetchMoreResult.getProjects,
            debouncedSearch,
            observable.variables?.filter?.name,
          ),
        };
      },
    }).catch((fetchError: unknown) => {
      toast({
        title: t('project-load-more-failed', 'Could not load more projects'),
        description:
          fetchError instanceof Error ? fetchError.message : undefined,
        variant: 'destructive',
      });
    });
  };

  return (
    <ContactConnectionPicker
      labels={{
        title: t('connect-project', 'Connect project'),
        help: t(
          'connect-project-help',
          'Choose an existing project with empty customer or company fields. Existing contact links are kept.',
        ),
        search: t('search-projects', 'Search projects...'),
        list: t('existing-projects', 'Existing projects'),
        connecting: t('connecting-project', 'Connecting project...'),
        create: t('create-project', 'Create project'),
      }}
      search={search}
      onSearchChange={setSearch}
      loading={loading}
      connecting={connecting}
      error={error}
      onRetry={() => void refetch().catch(() => undefined)}
      onClose={onClose}
      onCreate={onCreate}
    >
      {projects.map((project) => {
        const connectable = Boolean(
          getContactConnectionUpdate(project, contacts),
        );
        return (
          <Command.Item
            key={project._id}
            value={project._id}
            disabled={
              connecting ||
              loading ||
              search !== debouncedSearch ||
              !connectable
            }
            onSelect={() => void connectProject(project._id)}
            className="gap-2"
          >
            <IconClipboard className="size-4 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate">
              {project.name || t('untitled', 'Untitled')}
            </span>
            {!connectable && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {(!contacts.customerId ||
                  contacts.customerId === project.customerId) &&
                (!contacts.companyId ||
                  contacts.companyId === project.companyId)
                  ? t('already-connected', 'Already connected')
                  : t('linked-to-another-contact', 'Linked elsewhere')}
              </span>
            )}
          </Command.Item>
        );
      })}
      {pageInfo?.hasNextPage && (
        <Combobox.FetchMore
          key={`${debouncedSearch}:${pageInfo.endCursor}`}
          fetchMore={loadMore}
          currentLength={projects.length}
          totalCount={data?.getProjects?.totalCount ?? 0}
          disabled
          aria-label={t('loading-more-projects', 'Loading more projects...')}
        />
      )}
    </ContactConnectionPicker>
  );
};
