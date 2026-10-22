import { compactList, mergeCursorList } from '@/operation/utils/cursorList';
import { StatusInlineIcon } from '@/operation/components/StatusInline';
import { GET_PROJECTS_INLINE } from '@/project/graphql/queries/getProjects';
import { useQuery } from '@apollo/client';
import { IconLink } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  EnumCursorDirection,
  Popover,
  Spinner,
  toast,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebounce } from 'use-debounce';
import { WidgetQueryError } from './WidgetQueryError';

interface ConnectProjectRelationProps {
  projectIds: string[];
  onSelect: (projectId: string) => Promise<boolean>;
  disabled: boolean;
  showText?: boolean;
}

const ConnectProjectContent = ({
  projectIds,
  onSelect,
  disabled,
}: Omit<ConnectProjectRelationProps, 'showText'>) => {
  const { t } = useTranslation('operation');
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 500);
  const filter = { name: debouncedSearch, cursor: '', limit: 30 };
  const { data, loading, error, fetchMore, refetch } = useQuery(
    GET_PROJECTS_INLINE,
    { variables: { filter }, notifyOnNetworkStatusChange: true },
  );
  const projects = compactList(data?.getProjects?.list);
  const busy = disabled || loading || search !== debouncedSearch;

  const handleFetchMore = () => {
    const pageInfo = data?.getProjects?.pageInfo;
    if (busy || !pageInfo?.hasNextPage || !pageInfo.endCursor) return;

    void fetchMore({
      variables: {
        filter: { ...filter, cursor: pageInfo.endCursor, direction: 'forward' },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!prev.getProjects || !fetchMoreResult.getProjects) return prev;
        return {
          ...prev,
          getProjects: mergeCursorList(
            EnumCursorDirection.FORWARD,
            prev.getProjects,
            fetchMoreResult.getProjects,
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
    <Command shouldFilter={false}>
      <Command.Input
        placeholder={t('search-project')}
        aria-label={t('search-project')}
        value={search}
        onValueChange={setSearch}
        disabled={disabled}
      />
      <Command.List aria-busy={busy}>
        {error ? (
          <WidgetQueryError error={error} onRetry={refetch} disabled={busy} />
        ) : (
          <>
            {!busy && <Command.Empty>{t('no-project-found')}</Command.Empty>}
            {projects.map((project) => {
              const connected = projectIds.includes(project._id);
              return (
                <Command.Item
                  key={project._id}
                  value={project._id}
                  disabled={busy || connected}
                  onSelect={() => void onSelect(project._id)}
                >
                  <StatusInlineIcon statusType={project.status} />
                  <span className="truncate flex-1">{project.name}</span>
                  <Combobox.Check checked={connected} />
                </Command.Item>
              );
            })}
            {busy ? (
              <Spinner containerClassName="py-4" />
            ) : (
              <Combobox.FetchMore
                fetchMore={handleFetchMore}
                onSelect={handleFetchMore}
                totalCount={data?.getProjects?.totalCount ?? 0}
                currentLength={projects.length}
              />
            )}
          </>
        )}
      </Command.List>
    </Command>
  );
};

export const ConnectProjectRelation = ({
  projectIds,
  onSelect,
  disabled,
  showText,
}: ConnectProjectRelationProps) => {
  const { t } = useTranslation('operation');
  const [open, setOpen] = useState(false);
  const label = t('connect-project', { defaultValue: 'Connect project' });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <Button
          variant="secondary"
          size="sm"
          aria-label={label}
          disabled={disabled}
          onClick={(event) => event.stopPropagation()}
        >
          <IconLink className="size-4" />
          {showText && label}
        </Button>
      </Popover.Trigger>
      <Combobox.Content onClick={(event) => event.stopPropagation()}>
        {open && (
          <ConnectProjectContent
            projectIds={projectIds}
            disabled={disabled}
            onSelect={async (projectId) => {
              const connected = await onSelect(projectId);
              if (connected) setOpen(false);
              return connected;
            }}
          />
        )}
      </Combobox.Content>
    </Popover>
  );
};
