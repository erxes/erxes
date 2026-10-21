import { useQuery } from '@apollo/client';
import {
  IconArrowUpRight,
  IconCheck,
  IconCircleDashed,
  IconCopy,
  IconLock,
} from '@tabler/icons-react';
import { Button, Collapsible, Sheet, Skeleton, useToast } from 'erxes-ui';
import { CREDENTIALS_DETAIL } from '../graphql';
import {
  CONNECTION_PROVIDERS,
  categoryName,
  connectionIsConfigured,
  providerName,
} from '../providers';
import type { CredentialMetadata, CredentialTemplate } from '../types';
import { ConnectionConsumerAccess } from './ConnectionConsumerAccess';
import { ProviderLogo } from './ProviderLogo';

export function ConnectionDetail({
  connectionId,
  templates,
  canManage,
  canManageGrants,
  onClose,
  onEdit,
  onDelete,
}: {
  connectionId: string;
  templates: CredentialTemplate[];
  canManage: boolean;
  canManageGrants: boolean;
  onClose: () => void;
  onEdit: (connection: CredentialMetadata) => void;
  onDelete: (connection: CredentialMetadata) => void;
}) {
  const { data, loading, error, refetch } = useQuery<{
    credentialsDetail: CredentialMetadata | null;
  }>(CREDENTIALS_DETAIL, {
    variables: { _id: connectionId },
    fetchPolicy: 'network-only',
  });
  const { toast } = useToast();
  const connection = data?.credentialsDetail;
  const setup = connection
    ? CONNECTION_PROVIDERS[connection.templateId]
    : undefined;
  const retry = () => {
    void refetch().catch(() => {
      /* The query renders a retry state. */
    });
  };
  const copyReference = async () => {
    if (!connection) return;
    try {
      await navigator.clipboard.writeText(connection.reference);
      toast({ title: 'Connection reference copied', variant: 'success' });
    } catch {
      toast({ title: 'Could not copy reference', variant: 'destructive' });
    }
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <Sheet.View className="p-0 sm:max-w-xl motion-reduce:animate-none">
        <Sheet.Header>
          <Sheet.Title className="text-sm">Connection details</Sheet.Title>
          <Sheet.Description className="sr-only">
            Manage provider account settings and app access.
          </Sheet.Description>
          <Sheet.Close aria-label="Close connection details" />
        </Sheet.Header>
        <Sheet.Content className="space-y-6 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-4" aria-label="Loading connection">
              <Skeleton className="size-12" />
              <Skeleton className="h-6 w-2/3" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : error || !connection ? (
            <div role="alert" className="space-y-3">
              <p
                id="connection-detail-description"
                className="text-sm text-muted-foreground"
              >
                {error
                  ? 'We couldn’t load this connection. Check your permissions and try again.'
                  : 'This connection was removed or is no longer available.'}
              </p>
              {error && (
                <Button variant="outline" onClick={retry}>
                  Retry
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-start gap-4">
                <ProviderLogo
                  provider={connection.templateId}
                  className="size-14"
                />
                <div className="min-w-0 space-y-1.5">
                  <h2 className="break-words text-xl font-semibold tracking-tight">
                    {connection.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {providerName(connection.templateId, templates)} ·{' '}
                    {categoryName(connection.category)}
                  </p>
                </div>
              </div>
              <div className="space-y-2 rounded-lg bg-muted/40 p-4">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <IconCircleDashed className="size-4 text-muted-foreground" />
                  {connectionIsConfigured(connection)
                    ? 'Configured · not verified'
                    : 'Setup incomplete'}
                </p>
                <p
                  id="connection-detail-description"
                  className="text-xs leading-relaxed text-muted-foreground"
                >
                  Your account details are saved securely. Provider access has
                  not been tested, and existing integration settings are
                  unchanged.
                </p>
              </div>
              {connection.description && (
                <p className="break-words text-sm text-muted-foreground">
                  {connection.description}
                </p>
              )}
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Account details</h3>
                <dl className="divide-y">
                  {connection.fields.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center justify-between gap-4 py-3 text-sm"
                    >
                      <dt className="min-w-0 break-words">
                        {field.label || field.key}
                      </dt>
                      <dd className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                        {field.hasValue ? (
                          <>
                            <IconCheck className="size-3.5" />
                            Saved securely
                          </>
                        ) : (
                          'Not set'
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <IconLock className="size-3.5" />
                  Saved values are never displayed.
                </p>
              </section>
              {setup && (
                <Button asChild variant="outline">
                  <a
                    href={setup.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Provider guide
                    <IconArrowUpRight />
                  </a>
                </Button>
              )}
              <dl className="grid grid-cols-2 gap-4 border-t pt-5 text-xs">
                <div>
                  <dt className="text-muted-foreground">Added</dt>
                  <dd className="mt-1">
                    {new Date(connection.createdAt).toLocaleDateString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Last updated</dt>
                  <dd className="mt-1">
                    {new Date(connection.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
              <Collapsible className="border-t pt-5">
                <Collapsible.Trigger asChild>
                  <Button variant="ghost" className="px-0 text-sm">
                    <Collapsible.TriggerIcon />
                    App access & developer settings
                  </Button>
                </Collapsible.Trigger>
                <Collapsible.Content className="space-y-5 pt-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">
                      Connection reference
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Authorized backend apps use this stable reference to read
                      the current configuration at runtime. A reference alone
                      does not grant access.
                    </p>
                    <div className="flex items-center gap-2 rounded-md bg-muted/40 p-3">
                      <code className="min-w-0 flex-1 break-all text-xs">
                        {connection.reference}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Copy connection reference"
                        onClick={copyReference}
                      >
                        <IconCopy />
                      </Button>
                    </div>
                  </div>
                  <ConnectionConsumerAccess
                    credentialId={connection._id}
                    canManage={canManageGrants}
                  />
                </Collapsible.Content>
              </Collapsible>
            </>
          )}
        </Sheet.Content>
        {connection && canManage && (
          <Sheet.Footer className="justify-between gap-2">
            <Button
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(connection)}
            >
              Remove connection
            </Button>
            <Button onClick={() => onEdit(connection)}>Edit details</Button>
          </Sheet.Footer>
        )}
      </Sheet.View>
    </Sheet>
  );
}
