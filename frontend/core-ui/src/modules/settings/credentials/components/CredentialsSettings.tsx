import { useQuery } from '@apollo/client';
import { IconKey, IconPlus, IconSearch } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import {
  AlertDialog,
  Button,
  Input,
  Label,
  Select,
  Skeleton,
  Table,
  useToast,
} from 'erxes-ui';
import {
  PageHeader,
  PageHeaderEnd,
  PageHeaderStart,
  usePermissionCheck,
} from 'ui-modules';
import { CredentialMetadata, CredentialTemplate } from '../types';
import { CREDENTIALS_DELETE, CREDENTIALS_LIST } from '../graphql';
import { CredentialEditor } from './CredentialEditor';
import { CredentialDetail } from './CredentialDetail';
import { useCredentialMutationClient } from '../useCredentialMutationClient';

export function CredentialsSettings() {
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
        You do not have permission to view workspace credentials.
      </div>
    );
  return (
    <CredentialsWorkspace
      canManage={hasActionPermission('credentialsManage')}
      canManageGrants={hasActionPermission('credentialGrantsManage')}
    />
  );
}

function CredentialsWorkspace({
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editor, setEditor] = useState<{
    credential?: CredentialMetadata;
  } | null>(null);
  const [deleting, setDeleting] = useState<CredentialMetadata | null>(null);
  const [busy, setBusy] = useState(false);
  const credentials = data?.credentialsList || [];
  const templates = data?.credentialsTemplates || [];
  const selected = credentials.find(({ _id }) => _id === selectedId);
  const categories = [
    ...new Set([
      ...knownCategories,
      ...templates.map((item) => item.category),
      ...credentials.map((item) => item.category),
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
  const remove = async () => {
    if (!deleting || !canManage) return;
    setBusy(true);
    try {
      await client.mutate({
        mutation: CREDENTIALS_DELETE,
        variables: { _id: deleting._id },
        fetchPolicy: 'no-cache',
      });
      toast({
        title: 'Credential deleted',
        description: 'Consumer access to this credential has ended.',
        variant: 'success',
      });
      setDeleting(null);
      setSelectedId(null);
      refresh();
    } catch {
      toast({
        title: 'Could not delete credential',
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
          <IconKey className="size-4" />
          <h1 className="text-sm font-semibold">Credentials</h1>
        </PageHeaderStart>
        <PageHeaderEnd>
          {canManage && (
            <Button
              onClick={() => setEditor({})}
              disabled={loading || !!error || !templates.length}
            >
              <IconPlus />
              Add credential
            </Button>
          )}
        </PageHeaderEnd>
      </PageHeader>
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto max-w-5xl space-y-5">
          <p className="text-sm text-muted-foreground">
            Manage reusable credentials and scoped backend consumer access.
            Saved values are never displayed.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="credentials-search">Search credentials</Label>
              <div className="relative">
                <IconSearch className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  id="credentials-search"
                  className="pl-9"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by name"
                  maxLength={120}
                />
              </div>
            </div>
            <div className="space-y-1.5 sm:w-48">
              <Label htmlFor="credentials-category">Category</Label>
              <Select
                value={category ? `category:${category}` : 'all'}
                onValueChange={(next) =>
                  setCategory(next === 'all' ? '' : next.slice(9))
                }
              >
                <Select.Trigger id="credentials-category">
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="all">All categories</Select.Item>
                  {categories.map((item) => (
                    <Select.Item key={item} value={`category:${item}`}>
                      {item}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>
          </div>
          {!loading && !error && credentials.length >= 200 && (
            <p role="status" className="text-sm text-muted-foreground">
              Showing the 200 most recently updated matches. Narrow your name
              search or category to find other credentials.
            </p>
          )}
          {loading ? (
            <div className="space-y-2" aria-label="Loading credentials">
              {[0, 1, 2].map((index) => (
                <Skeleton key={index} className="h-16 w-full" />
              ))}
            </div>
          ) : error ? (
            <div role="alert" className="rounded-md border p-6 space-y-3">
              <h2 className="font-medium">Credentials could not be loaded</h2>
              <p className="text-sm text-muted-foreground">
                Check your connection and permissions, then try again.
              </p>
              <Button variant="outline" onClick={refresh}>
                Retry
              </Button>
            </div>
          ) : !credentials.length ? (
            <div className="rounded-md border border-dashed px-6 py-14 text-center">
              <IconKey className="mx-auto mb-3 size-6 text-muted-foreground" />
              <h2 className="text-sm font-medium">
                {filtered ? 'No matching credentials' : 'No credentials yet'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {filtered
                  ? 'Try another search or category.'
                  : canManage
                  ? 'Add a credential to securely share it with backend consumers.'
                  : 'Credentials added by your workspace administrators will appear here.'}
              </p>
              {filtered && (
                <Button
                  className="mt-4"
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setCategory('');
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <Table className="min-w-[640px]">
                <Table.Header>
                  <Table.Row>
                    <Table.Head className="w-2/5">Name</Table.Head>
                    <Table.Head>Template</Table.Head>
                    <Table.Head>Category</Table.Head>
                    <Table.Head>Updated</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {credentials.map((item) => (
                    <Table.Row key={item._id}>
                      <Table.Cell className="px-3 py-3">
                        <Button
                          variant="link"
                          className="h-auto max-w-full justify-start p-0 text-foreground"
                          onClick={() => setSelectedId(item._id)}
                        >
                          <span className="truncate">{item.name}</span>
                        </Button>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {item.description || item.reference}
                        </p>
                      </Table.Cell>
                      <Table.Cell className="px-3 text-xs">
                        {templates.find(({ id }) => id === item.templateId)
                          ?.name || item.templateId}
                      </Table.Cell>
                      <Table.Cell className="px-3 text-xs">
                        <span className="block truncate">{item.category}</span>
                      </Table.Cell>
                      <Table.Cell className="px-3 text-xs text-muted-foreground">
                        {new Date(item.updatedAt).toLocaleDateString()}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
      </div>
      {selected && !editor && (
        <CredentialDetail
          key={selected._id}
          credential={selected}
          canManage={canManage}
          canManageGrants={canManageGrants}
          onClose={() => setSelectedId(null)}
          onEdit={() => setEditor({ credential: selected })}
          onDelete={() => setDeleting(selected)}
        />
      )}
      {editor && canManage && (
        <CredentialEditor
          credential={editor.credential}
          templates={templates}
          onClose={() => setEditor(null)}
          onSaved={refresh}
        />
      )}
      <AlertDialog
        open={!!deleting && canManage}
        onOpenChange={(open) => !open && !busy && setDeleting(null)}
      >
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Delete credential?</AlertDialog.Title>
            <AlertDialog.Description>
              Deleting {deleting?.name} permanently removes its stored values
              and ends all consumer access. This cannot be undone.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={busy}>Cancel</AlertDialog.Cancel>
            <Button variant="destructive" disabled={busy} onClick={remove}>
              {busy ? 'Deleting…' : 'Delete credential'}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
}
