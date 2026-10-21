import { useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  AlertDialog,
  Button,
  Dialog,
  Form,
  Input,
  Label,
  Skeleton,
  useToast,
} from 'erxes-ui';
import { IconCopy } from '@tabler/icons-react';
import { credentialGrantSchema, CredentialGrantValues } from '../form';
import {
  CREDENTIALS_GRANTS,
  CREDENTIALS_GRANT_CREATE,
  CREDENTIALS_GRANT_REVOKE,
} from '../graphql';
import { CredentialGrant } from '../types';
import { useCredentialMutationClient } from '../useCredentialMutationClient';

export function ConnectionConsumerAccess({
  credentialId,
  canManage,
}: {
  credentialId: string;
  canManage: boolean;
}) {
  const client = useCredentialMutationClient();
  const { toast } = useToast();
  const active = useRef(true);
  const allowed = useRef(canManage);
  const permissionVersion = useRef(0);
  if (allowed.current !== canManage) permissionVersion.current += 1;
  allowed.current = canManage;
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [revoking, setRevoking] = useState<CredentialGrant | null>(null);
  const { data, loading, error, refetch } = useQuery<{
    credentialsGrants: CredentialGrant[];
  }>(CREDENTIALS_GRANTS, {
    variables: { credentialId },
    fetchPolicy: 'network-only',
  });
  const form = useForm<CredentialGrantValues>({
    resolver: zodResolver(credentialGrantSchema),
    defaultValues: { pluginName: '', name: '' },
  });
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    if (!canManage) {
      setToken(null);
      setRevoking(null);
      form.reset();
    }
  }, [canManage, form]);
  const refresh = () => {
    void refetch().catch(() => {
      /* The query renders its retry state. */
    });
  };
  const issue = async (values: CredentialGrantValues) => {
    if (!canManage || busy) return;
    const issuedWithPermission = permissionVersion.current;
    setBusy(true);
    try {
      const result = await client.mutate<{
        credentialsGrantCreate: { token: string; grant: CredentialGrant };
      }>({
        mutation: CREDENTIALS_GRANT_CREATE,
        variables: { credentialId, ...values },
        fetchPolicy: 'no-cache',
      });
      const issued = result.data?.credentialsGrantCreate.token;
      if (!issued) throw new Error('Consumer token unavailable');
      toast({ title: 'Consumer access granted', variant: 'success' });
      if (active.current) {
        refresh();
        if (
          allowed.current &&
          issuedWithPermission === permissionVersion.current
        ) {
          setToken(issued);
          form.reset();
        }
      }
    } catch {
      toast({
        title: 'Could not create consumer access',
        description:
          'Check the plugin name and your permissions, then try again.',
        variant: 'destructive',
      });
    } finally {
      if (active.current) setBusy(false);
    }
  };
  const revoke = async () => {
    if (!revoking || !canManage || busy) return;
    setBusy(true);
    try {
      await client.mutate({
        mutation: CREDENTIALS_GRANT_REVOKE,
        variables: { _id: revoking._id },
        fetchPolicy: 'no-cache',
      });
      toast({ title: 'Consumer access revoked', variant: 'success' });
      if (active.current) {
        setRevoking(null);
        refresh();
      }
    } catch {
      toast({
        title: 'Could not revoke consumer access',
        description: 'Try again. Access has not been confirmed as revoked.',
        variant: 'destructive',
      });
    } finally {
      if (active.current) setBusy(false);
    }
  };
  const copyToken = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(token);
      toast({
        title: 'Token copied',
        description:
          'Store it securely and clear your clipboard when finished.',
        variant: 'success',
      });
    } catch {
      toast({ title: 'Could not copy token', variant: 'destructive' });
    }
  };

  return (
    <section className="space-y-4 border-t pt-5">
      <div>
        <h3 className="text-sm font-semibold">App access</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Each grant lets one backend app use this connection at runtime. Revoke
          access at any time.
        </p>
      </div>
      {loading ? (
        <Skeleton className="h-16 w-full" />
      ) : error ? (
        <div role="alert" className="space-y-2 text-sm">
          <p>Consumer access could not be loaded.</p>
          <Button variant="outline" onClick={refresh}>
            Retry
          </Button>
        </div>
      ) : data?.credentialsGrants.length ? (
        <div className="divide-y rounded-md border">
          {data.credentialsGrants.map((grant) => (
            <div
              key={grant._id}
              className="flex items-center justify-between gap-3 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{grant.name}</p>
                <p className="text-xs text-muted-foreground break-all">
                  {grant.pluginName} · {grant.revokedAt ? 'Revoked' : 'Active'}
                </p>
              </div>
              {canManage && !grant.revokedAt && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busy}
                  onClick={() => setRevoking(grant)}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          No apps have access yet. An administrator can grant access below.
        </p>
      )}
      {canManage && (
        <Form {...form}>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(issue)}
            autoComplete="off"
          >
            <Form.Field
              control={form.control}
              name="pluginName"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label variant="peer" className="text-sm font-medium">
                    Plugin name
                  </Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Description className="leading-relaxed text-muted-foreground">
                    Backend plugin name: 1–64 characters, starting with a
                    lowercase letter. Use lowercase letters, numbers and
                    hyphens.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label variant="peer" className="text-sm font-medium">
                    Grant name
                  </Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Button type="submit" variant="outline" disabled={busy}>
              {busy ? 'Working…' : 'Grant access'}
            </Button>
          </form>
        </Form>
      )}
      <AlertDialog
        open={!!revoking}
        onOpenChange={(open) => !open && !busy && setRevoking(null)}
      >
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Revoke consumer access?</AlertDialog.Title>
            <AlertDialog.Description>
              {revoking?.name} will immediately lose access to this connection.
              This cannot be undone.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={busy}>Cancel</AlertDialog.Cancel>
            <Button variant="destructive" disabled={busy} onClick={revoke}>
              {busy ? 'Revoking…' : 'Revoke access'}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
      {token && canManage && (
        <Dialog open onOpenChange={(open) => !open && setToken(null)}>
          <Dialog.Content className="max-w-lg">
            <Dialog.Header>
              <Dialog.Title>Save your consumer token</Dialog.Title>
              <Dialog.Description>
                This token is shown once. Store it in the plugin’s secure
                environment configuration. It cannot be retrieved after closing.
              </Dialog.Description>
            </Dialog.Header>
            <div className="space-y-2">
              <Label htmlFor="credential-consumer-token">Consumer token</Label>
              <div className="flex gap-2">
                <Input
                  id="credential-consumer-token"
                  type="password"
                  readOnly
                  value={token}
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Copy consumer token"
                  onClick={copyToken}
                >
                  <IconCopy />
                </Button>
              </div>
            </div>
            <Dialog.Footer>
              <Button onClick={() => setToken(null)}>
                I have saved the token
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      )}
    </section>
  );
}
