import { useQuery } from '@apollo/client';
import {
  IconArrowRight,
  IconCircleDashed,
  IconLock,
  IconPlugConnected,
  IconPlus,
  IconSearch,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import {
  AlertDialog,
  Button,
  Input,
  Label,
  Select,
  Skeleton,
  Tabs,
  useToast,
} from 'erxes-ui';
import {
  PageHeader,
  PageHeaderEnd,
  PageHeaderStart,
  usePermissionCheck,
} from 'ui-modules';
import type { CredentialMetadata, CredentialTemplate } from '../types';
import { CREDENTIALS_DELETE, CREDENTIALS_LIST } from '../graphql';
import {
  categoryName,
  connectionIsConfigured,
  providerName,
} from '../providers';
import { useCredentialMutationClient } from '../useCredentialMutationClient';
import { ConnectionEditor } from './ConnectionEditor';
import { ConnectionDetail } from './ConnectionDetail';
import { ProviderCatalog } from './ProviderCatalog';
import { ProviderLogo } from './ProviderLogo';

export function ConnectionsSettings() {
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  if (!isLoaded)
    return (
      <div className="p-6">
        <Skeleton className="h-32 w-full" />
      </div>
    );
  if (!hasActionPermission('credentialsRead'))
    return (
      <div role="alert" className="p-6 text-sm text-muted-foreground">
        You do not have permission to view workspace connections.
      </div>
    );
  return (
    <ConnectionsWorkspace
      canManage={hasActionPermission('credentialsManage')}
      canManageGrants={hasActionPermission('credentialGrantsManage')}
    />
  );
}

function ConnectionsWorkspace({
  canManage,
  canManageGrants,
}: {
  canManage: boolean;
  canManageGrants: boolean;
}) {
  const client = useCredentialMutationClient();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search.trim(), 300);
  const [category, setCategory] = useState('');
  const [knownCategories, setKnownCategories] = useState<string[]>([]);
  const [view, setView] = useState('connections');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<{
    connection?: CredentialMetadata;
    provider?: CredentialTemplate;
  } | null>(null);
  const [deleting, setDeleting] = useState<CredentialMetadata | null>(null);
  const [busy, setBusy] = useState(false);
  const { data, loading, error, refetch } = useQuery<{
    credentialsList: CredentialMetadata[];
    credentialsTemplates: CredentialTemplate[];
  }>(CREDENTIALS_LIST, {
    variables: {
      search: debouncedSearch || undefined,
      category: category || undefined,
    },
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
  });
  const connections = data?.credentialsList || [];
  const templates = data?.credentialsTemplates || [];
  const categories = [
    ...new Set([
      ...knownCategories,
      ...templates.map((item) => item.category),
      ...connections.map((item) => item.category),
      ...(category ? [category] : []),
    ]),
  ].sort();
  useEffect(() => {
    if (data)
      setKnownCategories((known) => [
        ...new Set([
          ...known,
          ...data.credentialsList.map((item) => item.category),
        ]),
      ]);
  }, [data]);
  const filtered = !!debouncedSearch || !!category;
  const refresh = () => {
    void refetch().catch(() => {
      /* The query renders its retry state. */
    });
  };
  const choose = canManage
    ? (provider: CredentialTemplate) => setEditor({ provider })
    : undefined;
  const viewConnection = (id: string) => {
    setEditor(null);
    setSelectedId(id);
  };
  const remove = async () => {
    if (!deleting || !canManage || busy) return;
    setBusy(true);
    try {
      await client.mutate({
        mutation: CREDENTIALS_DELETE,
        variables: { _id: deleting._id },
        fetchPolicy: 'no-cache',
      });
      toast({
        title: 'Connection removed',
        description: 'All app access to this connection has ended.',
        variant: 'success',
      });
      setDeleting(null);
      setSelectedId(null);
      refresh();
    } catch {
      toast({
        title: 'Could not remove connection',
        description: 'Check your permissions and try again.',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader>
        <PageHeaderStart>
          <IconPlugConnected className="size-4" />
          <h1 className="text-sm font-semibold">Connections</h1>
        </PageHeaderStart>
        <PageHeaderEnd>
          {canManage && (
            <Button
              onClick={() => setEditor({})}
              disabled={loading || !!error || !templates.length}
            >
              <IconPlus />
              New connection
            </Button>
          )}
        </PageHeaderEnd>
      </PageHeader>
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto max-w-5xl space-y-7">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              Your tools, connected to your workspace
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              Set up your AI, storage and email providers in one place. Manage
              account details without editing environment files.
            </p>
          </div>
          <Tabs value={view} onValueChange={setView} className="space-y-6">
            <Tabs.List>
              <Tabs.Trigger value="connections">My connections</Tabs.Trigger>
              <Tabs.Trigger value="catalog">Browse providers</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="connections" className="space-y-5">
              {(connections.length > 0 || filtered) && (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1 space-y-1.5">
                    <Label
                      variant="peer"
                      className="text-sm font-medium"
                      htmlFor="connections-search"
                    >
                      Search connections
                    </Label>
                    <div className="relative">
                      <IconSearch className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                      <Input
                        id="connections-search"
                        placeholder="Search by connection name"
                        className="pl-9"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        maxLength={120}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:w-48">
                    <Label
                      variant="peer"
                      className="text-sm font-medium"
                      htmlFor="connections-category"
                    >
                      Category
                    </Label>
                    <Select
                      value={category ? `category:${category}` : 'all'}
                      onValueChange={(next) =>
                        setCategory(next === 'all' ? '' : next.slice(9))
                      }
                    >
                      <Select.Trigger id="connections-category">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        <Select.Item value="all">All categories</Select.Item>
                        {categories.map((item) => (
                          <Select.Item key={item} value={`category:${item}`}>
                            {categoryName(item)}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </div>
                </div>
              )}
              {loading ? (
                <ConnectionSkeleton />
              ) : error ? (
                <ConnectionLoadError onRetry={refresh} />
              ) : !connections.length ? (
                filtered ? (
                  <div className="space-y-3 rounded-xl border border-dashed px-6 py-12 text-center">
                    <h3 className="text-sm font-medium">
                      No matching connections
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Try another name or category.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearch('');
                        setCategory('');
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <section className="space-y-7">
                    <div className="flex items-start gap-4 rounded-xl bg-muted/40 p-5">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border bg-background">
                        <IconPlugConnected className="size-5" />
                      </span>
                      <div className="space-y-1.5">
                        <h3 className="text-sm font-semibold">
                          Start with your first connection
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {canManage
                            ? 'Choose a provider below. We’ll ask only for the details it needs.'
                            : 'Your workspace administrator can add a connection. Browse the available providers below.'}
                        </p>
                      </div>
                    </div>
                    <ProviderCatalog templates={templates} onChoose={choose} />
                  </section>
                )
              ) : (
                <div className="space-y-2">
                  {connections.length >= 200 && (
                    <p
                      role="status"
                      className="mb-3 text-xs text-muted-foreground"
                    >
                      Showing the 200 latest matches. Narrow your search to find
                      other connections.
                    </p>
                  )}
                  {connections.map((connection) => (
                    <Button
                      key={connection._id}
                      variant="outline"
                      className="group h-auto w-full justify-start gap-4 whitespace-normal rounded-xl border border-border p-4 text-left shadow-none hover:bg-accent/40 motion-safe:transition-colors motion-safe:duration-200"
                      onClick={() => setSelectedId(connection._id)}
                    >
                      <ProviderLogo provider={connection.templateId} />
                      <span className="min-w-0 flex-1 space-y-1">
                        <span className="block truncate text-sm font-semibold">
                          {connection.name}
                        </span>
                        <span className="block text-xs font-normal text-muted-foreground">
                          {providerName(connection.templateId, templates)} ·{' '}
                          {categoryName(connection.category)}
                        </span>
                        <span className="block text-xs font-normal text-muted-foreground sm:hidden">
                          {connectionIsConfigured(connection)
                            ? 'Configured'
                            : 'Setup incomplete'}
                        </span>
                      </span>
                      <span className="hidden items-center gap-1.5 rounded-md bg-muted/60 px-2.5 py-1 text-xs font-normal text-muted-foreground sm:flex">
                        <IconCircleDashed className="size-3.5" />
                        {connectionIsConfigured(connection)
                          ? 'Configured'
                          : 'Setup incomplete'}
                      </span>
                      <IconArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground" />
                    </Button>
                  ))}
                </div>
              )}
            </Tabs.Content>
            <Tabs.Content value="catalog">
              {loading && !templates.length ? (
                <ConnectionSkeleton />
              ) : error && !templates.length ? (
                <ConnectionLoadError onRetry={refresh} />
              ) : (
                <ProviderCatalog templates={templates} onChoose={choose} />
              )}
            </Tabs.Content>
          </Tabs>
          <p className="flex items-start gap-2 border-t pt-5 text-xs leading-relaxed text-muted-foreground">
            <IconLock className="mt-0.5 size-3.5 shrink-0" />
            Account details are encrypted. Only apps you authorize can access
            them. Saving a connection doesn’t verify provider access.
          </p>
        </div>
      </div>
      {selectedId && !editor && !deleting && (
        <ConnectionDetail
          key={selectedId}
          connectionId={selectedId}
          templates={templates}
          canManage={canManage}
          canManageGrants={canManageGrants}
          onClose={() => setSelectedId(null)}
          onEdit={(connection) => setEditor({ connection })}
          onDelete={setDeleting}
        />
      )}
      {editor && canManage && (
        <ConnectionEditor
          connection={editor.connection}
          initialProvider={editor.provider}
          templates={templates}
          onClose={() => setEditor(null)}
          onSaved={refresh}
          onView={viewConnection}
        />
      )}
      <AlertDialog
        open={!!deleting && canManage}
        onOpenChange={(open) => !open && !busy && setDeleting(null)}
      >
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Remove this connection?</AlertDialog.Title>
            <AlertDialog.Description>
              Removing {deleting?.name} permanently deletes its account details
              and revokes all app access. Apps using it will stop working. This
              cannot be undone.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={busy}>
              Keep connection
            </AlertDialog.Cancel>
            <Button variant="destructive" disabled={busy} onClick={remove}>
              {busy ? 'Removing…' : 'Remove connection'}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
}

function ConnectionSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading connections">
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

function ConnectionLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div role="alert" className="space-y-3 rounded-xl border p-6">
      <h3 className="text-sm font-semibold">Connections couldn’t be loaded</h3>
      <p className="text-sm text-muted-foreground">
        Check your connection and permissions, then try again.
      </p>
      <Button variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
