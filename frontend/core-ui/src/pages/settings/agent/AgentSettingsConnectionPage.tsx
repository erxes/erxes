import {
  IconDeviceFloppy,
  IconEye,
  IconEyeOff,
  IconSparkles,
  IconTrash,
} from '@tabler/icons-react';
import { useMutation } from '@apollo/client';
import {
  AlertDialog,
  Badge,
  Breadcrumb,
  Button,
  Input,
  Label,
  RadioGroup,
  Separator,
  Spinner,
  buttonVariants,
  formatDateISOStringToRelativeDate,
  toast,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PageHeader,
  SIDE_PANEL_CHAT_PATH,
  usePermissionCheck,
  useSidePanel,
} from 'ui-modules';

import { ProviderIcon } from '@/agent/components/ProviderIcon';
import {
  getProviderLabel,
  getProviderOption,
  ProviderPicker,
} from '@/agent/components/ProviderPicker';
import {
  AGENTS_CONNECTIONS,
  AGENTS_CONNECTION_REMOVE,
  AGENTS_CONNECTION_SET_DEFAULT,
  AGENTS_CONNECTION_UPSERT,
  AGENTS_MODELS,
} from '@/agent/graphql/connection';
import type {
  AgentsConnectionScope,
  IAgentsConnectionEntry,
} from '@/agent/graphql/connection';
import type {
  IAgentsConnectionRemoveData,
  IAgentsConnectionRemoveVariables,
  IAgentsConnectionSetDefaultData,
  IAgentsConnectionSetDefaultVariables,
  IAgentsConnectionUpsertData,
  IAgentsConnectionUpsertVariables,
} from '@/agent/graphql/connection';
import {
  findDefaultAgentsConnection,
  useAgentsConnection,
} from '@/agent/hooks/useAgentsConnection';
import { useAgentsBuiltin } from '@/agent/hooks/useAgentsBuiltin';

const SCOPE_OPTIONS: {
  value: AgentsConnectionScope;
  label: string;
  description: string;
}[] = [
  {
    value: 'private',
    label: 'Private',
    description: 'Only you can use this key.',
  },
  {
    value: 'organization',
    label: 'Organization',
    description: 'Everyone in this workspace can chat with it.',
  },
];

const connectionKey = (connection: IAgentsConnectionEntry) =>
  `${connection.scope ?? 'private'}:${connection.provider}`;

const formatTokens = (tokens: number) =>
  new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(tokens);

/**
 * Settings BYOK management: every configured provider is listed with its
 * stored entry, and more providers can be added side by side — pick a
 * provider, paste the API key, save. The model is chosen server-side by the
 * provider default (overridable from the chat's model picker), so there is
 * no model field here. One connection is the default an unselected chat turn
 * runs on (the first saved until the user picks another). The backend never
 * returns stored keys.
 */
export const AgentSettingsConnectionPage = () => {
  const { openPath } = useSidePanel();
  const { connections, loading, error } = useAgentsConnection();
  const { builtin, percent: builtinPercent } = useAgentsBuiltin();

  const [provider, setProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  useEffect(() => {
    setApiKey('');
    setShowKey(false);
  }, [provider]);
  const [showKey, setShowKey] = useState(false);
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canManage = isLoaded && hasActionPermission('manageAgentsSettings');
  const [scope, setScope] = useState<AgentsConnectionScope>('private');
  const [removingConnection, setRemovingConnection] =
    useState<IAgentsConnectionEntry | null>(null);
  const [defaultingKey, setDefaultingKey] = useState<string | null>(null);

  // An active chat model picker lists models per connection; a bare document
  // refetches it only while mounted, so saving never lists models needlessly.
  const refetchQueries = [{ query: AGENTS_CONNECTIONS }, AGENTS_MODELS];

  const [upsertConnection, { loading: saving }] = useMutation<
    IAgentsConnectionUpsertData,
    IAgentsConnectionUpsertVariables
  >(AGENTS_CONNECTION_UPSERT, {
    refetchQueries,
    onCompleted: () => {
      toast({ title: 'API key saved' });
      setProvider('');
      setApiKey('');
      setShowKey(false);
    },
    onError: (upsertError) => {
      toast({
        title: 'Failed to save the connection',
        description: upsertError.message,
        variant: 'destructive',
      });
    },
  });

  const [removeConnection, { loading: removing }] = useMutation<
    IAgentsConnectionRemoveData,
    IAgentsConnectionRemoveVariables
  >(AGENTS_CONNECTION_REMOVE, {
    refetchQueries,
    onCompleted: () => {
      toast({ title: 'API key removed' });
      setRemovingConnection(null);
    },
    onError: (removeError) => {
      toast({
        title: 'Failed to remove the connection',
        description: removeError.message,
        variant: 'destructive',
      });
    },
  });

  const [setDefaultConnection, { loading: settingDefault }] = useMutation<
    IAgentsConnectionSetDefaultData,
    IAgentsConnectionSetDefaultVariables
  >(AGENTS_CONNECTION_SET_DEFAULT, {
    refetchQueries: [{ query: AGENTS_CONNECTIONS }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      toast({ title: 'Default provider updated' });
      setDefaultingKey(null);
    },
    onError: (setDefaultError) => {
      toast({
        title: 'Failed to set the default provider',
        description: setDefaultError.message,
        variant: 'destructive',
      });
      setDefaultingKey(null);
    },
  });

  const defaultConnection = findDefaultAgentsConnection(connections);
  const defaultKey = defaultConnection
    ? connectionKey(defaultConnection)
    : undefined;
  const privateConnections = connections.filter(
    (connection) => connection.scope !== 'organization',
  );
  const organizationConnections = connections.filter(
    (connection) => connection.scope === 'organization',
  );

  const handleSetDefault = (connection: IAgentsConnectionEntry) => {
    if (settingDefault) {
      return;
    }

    setDefaultingKey(connectionKey(connection));
    void setDefaultConnection({
      variables: {
        provider: connection.provider,
        scope: connection.scope ?? 'private',
      },
    });
  };

  const handleSave = () => {
    const trimmedProvider = provider.trim();

    if (!trimmedProvider || saving) {
      return;
    }

    void upsertConnection({
      variables: {
        provider: trimmedProvider,
        scope,
        ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
      },
    });
  };

  const selectedProvider = provider.trim();
  const storedProvider = connections.find(
    (connection) =>
      connection.provider === selectedProvider &&
      (connection.scope ?? 'private') === scope,
  );

  return (
    <div className="flex h-full flex-col">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button
                  variant="ghost"
                  onClick={() => openPath(SIDE_PANEL_CHAT_PATH)}
                >
                  <IconSparkles />
                  Assistant
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/settings/agent">Settings</Link>
                </Button>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <span className="text-muted-foreground">API key</span>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton
            breadcrumb={['Agents', 'Settings', 'API key']}
            icon="IconSparkles"
          />
        </PageHeader.Start>
      </PageHeader>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center p-8">
            <Spinner className="size-5" />
          </div>
        ) : error ? (
          <p className="mx-auto max-w-xl p-6 text-sm text-destructive">
            {error}
          </p>
        ) : (
          <div className="mx-auto max-w-2xl space-y-4 p-6">
            {builtin && (
              <div className="rounded-xl border p-6">
                <div className="flex items-center gap-3">
                  <ProviderIcon
                    provider={builtin.provider}
                    className="size-8"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {builtin.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      Included with your workspace. No API key needed.
                    </p>
                  </div>
                  {connections.length === 0 && (
                    <Badge variant="secondary" className="shrink-0">
                      Default
                    </Badge>
                  )}
                </div>
                <div className="mt-4 flex flex-col gap-1.5 text-xs text-muted-foreground">
                  <span>
                    {builtin.limitTokens
                      ? `${formatTokens(builtin.usedTokens)} of ${formatTokens(
                          builtin.limitTokens,
                        )} tokens used this month`
                      : `${formatTokens(
                          builtin.usedTokens,
                        )} tokens used this month`}
                    {` · Resets ${new Date(
                      builtin.resetsAt,
                    ).toLocaleDateString()}`}
                  </span>
                  {builtinPercent !== null && (
                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={
                          builtinPercent >= 90
                            ? 'h-full bg-destructive'
                            : 'h-full bg-primary'
                        }
                        style={{ width: `${builtinPercent}%` }}
                      />
                    </div>
                  )}
                  {builtin.exhausted && (
                    <span className="text-destructive">
                      Monthly limit reached. Add your own API key below to keep
                      chatting.
                    </span>
                  )}
                </div>
              </div>
            )}
            <div className="rounded-xl border p-6">
              <div className="mb-4">
                <Label className="font-sans text-sm font-medium normal-case">
                  Configured providers
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Each provider keeps its own key; the chat's model picker lists
                  models from every configured provider. The default provider
                  runs when no model is selected.
                </p>
              </div>

              {connections.length === 0 ? (
                <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed p-6 text-center">
                  <IconSparkles
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-muted-foreground">
                    No provider configured yet. Add one below.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    {
                      title: 'Private',
                      hint: 'Only you can use these keys.',
                      entries: privateConnections,
                    },
                    {
                      title: 'Organization',
                      hint: canManage
                        ? 'Everyone in this workspace can chat with these keys. Only admins can change them.'
                        : 'Shared by your workspace admins. Your private key for the same provider is used first.',
                      entries: organizationConnections,
                    },
                  ]
                    .filter((group) => group.entries.length > 0)
                    .map((group) => (
                      <div key={group.title} className="space-y-2">
                        <div>
                          <p className="text-xs font-medium">{group.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {group.hint}
                          </p>
                        </div>
                        <ul className="space-y-2">
                          {group.entries.map((connection) => {
                            const option = getProviderOption(
                              connection.provider,
                            );
                            const key = connectionKey(connection);
                            const editable =
                              connection.scope !== 'organization' || canManage;
                            const label = `${
                              connection.scope === 'organization'
                                ? 'organization '
                                : ''
                            }${getProviderLabel(connection.provider)}`;

                            return (
                              <li
                                key={key}
                                className="flex items-center gap-3 rounded-lg border px-3 py-2.5"
                              >
                                <ProviderIcon
                                  provider={connection.provider}
                                  className="size-8"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-medium">
                                    {getProviderLabel(connection.provider)}{' '}
                                    <span className="font-normal text-muted-foreground">
                                      ({connection.model})
                                    </span>
                                  </p>
                                  {option && (
                                    <p className="truncate text-xs text-muted-foreground">
                                      {option.description}
                                    </p>
                                  )}
                                </div>
                                {key === defaultKey ? (
                                  <Badge
                                    variant="secondary"
                                    className="shrink-0"
                                  >
                                    Default
                                  </Badge>
                                ) : (
                                  editable && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 shrink-0 px-2 text-xs font-normal text-muted-foreground"
                                      disabled={settingDefault}
                                      aria-label={`Set ${label} as default`}
                                      onClick={() =>
                                        handleSetDefault(connection)
                                      }
                                    >
                                      {settingDefault &&
                                      defaultingKey === key ? (
                                        <Spinner className="size-3.5" />
                                      ) : (
                                        'Set as default'
                                      )}
                                    </Button>
                                  )
                                )}
                                {connection.hasKey ? (
                                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                                    <span
                                      className="size-1.5 shrink-0 rounded-full bg-emerald-500"
                                      aria-hidden="true"
                                    />
                                    {connection.updatedAt
                                      ? formatDateISOStringToRelativeDate(
                                          connection.updatedAt,
                                        )
                                      : ''}
                                  </span>
                                ) : (
                                  // The server cannot open this stored key (missing or
                                  // changed encryption secret); saving it again fixes it.
                                  <span
                                    className="flex shrink-0 items-center gap-1.5 text-xs text-destructive"
                                    title="This key can't be read on the server. Select the provider below and paste the key again."
                                  >
                                    <span
                                      className="size-1.5 shrink-0 rounded-full bg-destructive"
                                      aria-hidden="true"
                                    />
                                    Re-enter key
                                  </span>
                                )}
                                {editable && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                                    aria-label={`Remove ${label} key`}
                                    onClick={() =>
                                      setRemovingConnection(connection)
                                    }
                                  >
                                    <IconTrash className="size-3.5" />
                                  </Button>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border p-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="font-sans text-sm font-medium normal-case">
                    Who can use this key
                  </Label>
                  <RadioGroup
                    className="grid grid-cols-2 gap-2"
                    value={scope}
                    onValueChange={(value) => {
                      setScope(value as AgentsConnectionScope);
                      setApiKey('');
                      setShowKey(false);
                    }}
                  >
                    {SCOPE_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-start gap-3 rounded-lg border p-3 has-data-[state=checked]:border-primary/60 has-data-[state=checked]:bg-accent/40 has-disabled:opacity-60"
                      >
                        <RadioGroup.Item
                          value={option.value}
                          aria-label={option.label}
                          disabled={
                            option.value === 'organization' && !canManage
                          }
                          className="mt-0.5"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium">
                            {option.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                  {!canManage && (
                    <p className="text-xs text-muted-foreground">
                      Only workspace admins can add organization keys.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="font-sans text-sm font-medium normal-case">
                    Add or update a provider
                  </Label>
                  <ProviderPicker
                    value={provider}
                    onChange={(nextProvider) => {
                      setProvider(nextProvider);
                      setApiKey('');
                      setShowKey(false);
                    }}
                  />
                </div>

                {selectedProvider && (
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="agents-settings-api-key"
                      className="font-sans text-sm font-medium normal-case"
                    >
                      API key
                    </Label>
                    <div className="relative">
                      <Input
                        id="agents-settings-api-key"
                        type={showKey ? 'text' : 'password'}
                        value={apiKey}
                        onChange={(event) => setApiKey(event.target.value)}
                        autoComplete="off"
                        className="pr-10"
                        placeholder={
                          storedProvider?.hasKey
                            ? 'Saved — leave empty to keep your current key'
                            : 'Paste your API key'
                        }
                      />
                      <div className="absolute inset-y-0 right-1 flex items-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowKey((visible) => !visible)}
                          aria-label={showKey ? 'Hide API key' : 'Show API key'}
                          aria-pressed={showKey}
                        >
                          {showKey ? (
                            <IconEyeOff className="size-3.5" />
                          ) : (
                            <IconEye className="size-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your key is stored securely and never displayed again.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSave}
                  disabled={!selectedProvider || saving}
                >
                  {saving ? (
                    <Spinner className="size-4" />
                  ) : (
                    <IconDeviceFloppy />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AlertDialog
        open={removingConnection !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRemovingConnection(null);
          }
        }}
      >
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title className="flex items-center gap-2">
              {removingConnection && (
                <ProviderIcon
                  provider={removingConnection.provider}
                  className="size-5"
                />
              )}
              Remove{' '}
              {removingConnection?.scope === 'organization'
                ? 'organization '
                : ''}
              {removingConnection
                ? getProviderLabel(removingConnection.provider)
                : ''}{' '}
              key
            </AlertDialog.Title>
            <AlertDialog.Description>
              This provider disappears from the chat's model picker until a new
              key is added.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action
              className={buttonVariants({ variant: 'destructive' })}
              disabled={removing}
              onClick={(event) => {
                event.preventDefault();

                if (removingConnection) {
                  void removeConnection({
                    variables: {
                      provider: removingConnection.provider,
                      scope: removingConnection.scope ?? 'private',
                    },
                  });
                }
              }}
            >
              {removing ? <Spinner className="size-4" /> : 'Remove'}
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </div>
  );
};
