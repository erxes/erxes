import { useQuery } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  IconArrowRight,
  IconCheck,
  IconCode,
  IconCopy,
  IconInfoCircle,
} from '@tabler/icons-react';
import { useAtomValue } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { pluginsConfigState } from 'ui-modules';
import {
  AlertDialog,
  Button,
  Collapsible,
  Dialog,
  Form,
  Input,
  Label,
  Select,
  Skeleton,
  useToast,
} from 'erxes-ui';
import {
  connectionAccessName,
  connectionAppLabel,
  connectionApps,
  connectionSetupInstructions,
} from '../appAccess';
import { credentialGrantSchema } from '../form';
import {
  CREDENTIALS_GRANTS,
  CREDENTIALS_GRANT_CREATE,
  CREDENTIALS_GRANT_REVOKE,
} from '../graphql';
import type { CredentialGrant } from '../types';
import { useCredentialMutationClient } from '../useCredentialMutationClient';

type AppSelection = { pluginName: string };
type PreparedAccess = { token: string; pluginName: string };

export function ConnectionAppAccess({
  credentialId,
  connectionName,
  reference,
  canManage,
}: {
  credentialId: string;
  connectionName: string;
  reference: string;
  canManage: boolean;
}) {
  const client = useCredentialMutationClient();
  const { toast } = useToast();
  const installed = useAtomValue(pluginsConfigState);
  const apps = connectionApps(installed);
  const active = useRef(true);
  const allowed = useRef(canManage);
  const permissionVersion = useRef(0);
  const inFlight = useRef(false);
  if (allowed.current !== canManage) permissionVersion.current += 1;
  allowed.current = canManage;
  const [prepared, setPrepared] = useState<PreparedAccess | null>(null);
  const [copied, setCopied] = useState(false);
  const [custom, setCustom] = useState(false);
  const [busy, setBusy] = useState(false);
  const [revoking, setRevoking] = useState<CredentialGrant | null>(null);
  const { data, loading, error, refetch } = useQuery<{
    credentialsGrants: CredentialGrant[];
  }>(CREDENTIALS_GRANTS, {
    variables: { credentialId },
    fetchPolicy: 'network-only',
  });
  const form = useForm<AppSelection>({
    resolver: zodResolver(credentialGrantSchema.pick({ pluginName: true })),
    defaultValues: { pluginName: '' },
  });

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  useEffect(() => {
    if (!canManage) {
      setPrepared(null);
      setCopied(false);
      setRevoking(null);
      setCustom(false);
      form.reset();
    }
  }, [canManage, form]);

  const refresh = () => {
    void refetch().catch(() => {
      /* The query renders its retry state. */
    });
  };
  const issue = async ({ pluginName }: AppSelection) => {
    if (!canManage || inFlight.current) return;
    if (!custom && !apps.some((app) => app.id === pluginName)) {
      form.setError('pluginName', { message: 'Choose an available app.' });
      return;
    }
    const issuedWithPermission = permissionVersion.current;
    inFlight.current = true;
    setBusy(true);
    try {
      const input = credentialGrantSchema.parse({
        pluginName,
        name: connectionAccessName(connectionAppLabel(pluginName)),
      });
      const result = await client.mutate<{
        credentialsGrantCreate: { token: string; grant: CredentialGrant };
      }>({
        mutation: CREDENTIALS_GRANT_CREATE,
        variables: { credentialId, ...input },
        fetchPolicy: 'no-cache',
      });
      const token = result.data?.credentialsGrantCreate.token;
      if (!token) throw new Error('App setup unavailable');
      if (active.current) {
        refresh();
        if (
          allowed.current &&
          issuedWithPermission === permissionVersion.current
        ) {
          setCopied(false);
          setPrepared({ token, pluginName });
          setCustom(false);
          form.reset();
          toast({
            title: 'Setup details created',
            description:
              'A developer still needs to finish connecting the app.',
            variant: 'success',
          });
        }
      }
    } catch {
      if (active.current)
        toast({
          title: 'Could not prepare app setup',
          description: 'Check your permissions and try again.',
          variant: 'destructive',
        });
    } finally {
      inFlight.current = false;
      if (active.current) setBusy(false);
    }
  };
  const revoke = async () => {
    if (!revoking || !canManage || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    try {
      await client.mutate({
        mutation: CREDENTIALS_GRANT_REVOKE,
        variables: { _id: revoking._id },
        fetchPolicy: 'no-cache',
      });
      if (active.current) {
        toast({ title: 'App access removed', variant: 'success' });
        setRevoking(null);
        refresh();
      }
    } catch {
      if (active.current)
        toast({
          title: 'Could not remove app access',
          description: 'Access has not been confirmed as removed. Try again.',
          variant: 'destructive',
        });
    } finally {
      inFlight.current = false;
      if (active.current) setBusy(false);
    }
  };
  const copySetup = async () => {
    if (!prepared || !allowed.current) return;
    const version = permissionVersion.current;
    try {
      await navigator.clipboard.writeText(
        connectionSetupInstructions({ connectionName, reference, ...prepared }),
      );
      if (
        active.current &&
        allowed.current &&
        version === permissionVersion.current
      ) {
        setCopied(true);
        toast({
          title: 'Private setup details copied',
          description:
            'Share through a secure channel, then clear your clipboard.',
          variant: 'success',
        });
      }
    } catch {
      if (active.current)
        toast({
          title: 'Could not copy setup details',
          description: 'Allow clipboard access in your browser and try again.',
          variant: 'destructive',
        });
    }
  };
  const closeSetup = () => {
    setPrepared(null);
    setCopied(false);
  };

  return (
    <section
      className="space-y-4 border-t pt-5"
      aria-label="Use this connection"
    >
      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold">Use this connection</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Choose which app can use these account details.
        </p>
      </div>
      <div className="flex gap-2.5 rounded-lg bg-muted/40 p-4">
        <IconInfoCircle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            A developer needs to finish app setup
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Apps aren’t linked automatically yet. Create private setup
            instructions for your developer to finish the connection.
          </p>
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-16 w-full" />
      ) : error ? (
        <div role="alert" className="space-y-2 text-sm">
          <p>We couldn’t load the apps with access.</p>
          <Button variant="outline" onClick={refresh}>
            Try again
          </Button>
        </div>
      ) : data?.credentialsGrants.length ? (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">
            Apps with access
          </h4>
          <div className="divide-y rounded-lg border">
            {data.credentialsGrants.map((grant) => (
              <div
                key={grant._id}
                className="flex items-center justify-between gap-3 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {connectionAppLabel(grant.pluginName)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {grant.revokedAt
                      ? 'Access removed'
                      : 'Access allowed · app setup may still be needed'}
                  </p>
                </div>
                {canManage && !grant.revokedAt && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busy}
                    onClick={() => setRevoking(grant)}
                  >
                    Remove access
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          No apps have access yet.
        </p>
      )}
      {canManage ? (
        <Form {...form}>
          <form
            className="space-y-4"
            autoComplete="off"
            onSubmit={form.handleSubmit(issue)}
          >
            <Form.Field
              control={form.control}
              name="pluginName"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label variant="peer" className="text-sm font-medium">
                    Which app should use this connection?
                  </Form.Label>
                  <Select
                    value={custom ? '__custom__' : field.value}
                    onValueChange={(value) => {
                      setCustom(value === '__custom__');
                      field.onChange(value === '__custom__' ? '' : value);
                    }}
                    disabled={busy || loading || !!error}
                  >
                    <Form.Control>
                      <Select.Trigger>
                        <Select.Value placeholder="Choose an app" />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {apps.map((app) => (
                        <Select.Item key={app.id} value={app.id}>
                          {app.label}
                        </Select.Item>
                      ))}
                      <Select.Item value="__custom__">
                        Custom backend (developers)
                      </Select.Item>
                    </Select.Content>
                  </Select>
                  {!custom && <Form.Message />}
                  <Form.Description className="leading-relaxed text-muted-foreground">
                    Choose an installed app, or erxes workspace for a core
                    feature.
                  </Form.Description>
                </Form.Item>
              )}
            />
            {custom && (
              <Form.Field
                control={form.control}
                name="pluginName"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label variant="peer" className="text-sm font-medium">
                      Backend identifier (developer only)
                    </Form.Label>
                    <Form.Control>
                      <Input
                        {...field}
                        placeholder="For example, custom-worker"
                        disabled={busy}
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={64}
                      />
                    </Form.Control>
                    <Form.Description className="leading-relaxed text-muted-foreground">
                      Use the app’s registered lowercase identifier. Leave this
                      to your developer if you’re unsure.
                    </Form.Description>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            )}
            <Button type="submit" disabled={busy || loading || !!error}>
              {busy ? 'Preparing…' : 'Create setup instructions'}
              <IconArrowRight />
            </Button>
          </form>
        </Form>
      ) : (
        <p className="text-sm text-muted-foreground">
          Ask your workspace administrator to prepare app access. You don’t need
          to change anything here.
        </p>
      )}
      <AlertDialog
        open={!!revoking && canManage}
        onOpenChange={(open) => !open && !busy && setRevoking(null)}
      >
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Remove this app’s access?</AlertDialog.Title>
            <AlertDialog.Description>
              {revoking ? connectionAppLabel(revoking.pluginName) : 'This app'}{' '}
              will no longer be able to use this connection. Your saved account
              details won’t be deleted.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel disabled={busy}>Keep access</AlertDialog.Cancel>
            <Button variant="destructive" disabled={busy} onClick={revoke}>
              {busy ? 'Removing…' : 'Remove access'}
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
      {prepared && canManage && (
        <Dialog open onOpenChange={(open) => !open && closeSetup()}>
          <Dialog.Content className="max-w-lg">
            <Dialog.Header>
              <Dialog.Title>One last step: connect the app</Dialog.Title>
              <Dialog.Description>
                Your developer needs the private setup details below to finish
                connecting {connectionAppLabel(prepared.pluginName)}.
              </Dialog.Description>
            </Dialog.Header>
            <ol className="space-y-4 text-sm">
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  1
                </span>
                <div className="space-y-1">
                  <p className="font-medium">Copy the private setup details</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    They include a one-time access key, not your provider
                    password or API key.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                  2
                </span>
                <div className="space-y-1">
                  <p className="font-medium">
                    Send them to your developer securely
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Your developer configures the app once. After that, you can
                    update this connection’s account details in Settings.
                  </p>
                </div>
              </li>
            </ol>
            <Button onClick={copySetup}>
              {copied ? <IconCheck /> : <IconCopy />}
              {copied ? 'Copy setup details again' : 'Copy setup details'}
            </Button>
            <p
              role="status"
              className="text-xs leading-relaxed text-muted-foreground"
            >
              {copied
                ? 'Copied. Share through a secure channel, then clear your clipboard. The app is not connected automatically.'
                : 'These details are shown only once. Save them before closing, or remove this access and create new instructions later.'}
            </p>
            <Collapsible>
              <Collapsible.Trigger asChild>
                <Button variant="ghost" className="px-0 text-xs">
                  <IconCode />
                  <Collapsible.TriggerIcon />
                  View developer access key
                </Button>
              </Collapsible.Trigger>
              <Collapsible.Content className="space-y-2 pt-3">
                <Label
                  variant="peer"
                  className="text-sm font-medium"
                  htmlFor="connection-app-token"
                >
                  One-time app access key
                </Label>
                <Input
                  id="connection-app-token"
                  type="password"
                  value={prepared.token}
                  readOnly
                  autoComplete="off"
                  spellCheck={false}
                  className="font-mono text-xs"
                />
              </Collapsible.Content>
            </Collapsible>
            <Dialog.Footer>
              <Button variant="secondary" onClick={closeSetup}>
                I’ve saved the setup details
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog>
      )}
    </section>
  );
}
