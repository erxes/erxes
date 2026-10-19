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
  Breadcrumb,
  Button,
  Input,
  Label,
  Separator,
  Spinner,
  buttonVariants,
  formatDateISOStringToRelativeDate,
  toast,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, SIDE_PANEL_CHAT_PATH, useSidePanel } from 'ui-modules';

import { ProviderIcon } from '@/agent/components/ProviderIcon';
import {
  getProviderLabel,
  getProviderOption,
  ProviderPicker,
} from '@/agent/components/ProviderPicker';
import {
  AGENTS_CONNECTIONS,
  AGENTS_CONNECTION_REMOVE,
  AGENTS_CONNECTION_UPSERT,
} from '@/agent/graphql/connection';
import type {
  IAgentsConnectionRemoveData,
  IAgentsConnectionRemoveVariables,
  IAgentsConnectionUpsertData,
  IAgentsConnectionUpsertVariables,
} from '@/agent/graphql/connection';
import { useAgentsConnection } from '@/agent/hooks/useAgentsConnection';

/**
 * Settings BYOK management: every configured provider is listed with its
 * stored entry, and more providers can be added side by side — pick a
 * provider, paste the API key, save. The model is chosen server-side by the
 * provider default (overridable from the chat's model picker), so there is
 * no model field here. The backend never returns stored keys.
 */
export const AgentSettingsConnectionPage = () => {
  const { openPath } = useSidePanel();
  const { connections, loading, error } = useAgentsConnection();

  const [provider, setProvider] = useState('');
  const [apiKey, setApiKey] = useState('');
  useEffect(() => {
    setApiKey('');
    setShowKey(false);
  }, [provider]);
  const [showKey, setShowKey] = useState(false);
  const [removingProvider, setRemovingProvider] = useState<string | null>(null);

  const refetchQueries = [{ query: AGENTS_CONNECTIONS }];

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
      setRemovingProvider(null);
    },
    onError: (removeError) => {
      toast({
        title: 'Failed to remove the connection',
        description: removeError.message,
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    const trimmedProvider = provider.trim();

    if (!trimmedProvider || saving) {
      return;
    }

    void upsertConnection({
      variables: {
        provider: trimmedProvider,
        ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
      },
    });
  };

  const selectedProvider = provider.trim();
  const storedProvider = connections.find(
    (connection) => connection.provider === selectedProvider,
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
            <div className="rounded-xl border p-6">
              <div className="mb-4">
                <Label className="font-sans text-sm font-medium normal-case">
                  Configured providers
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">
                  Each provider keeps its own key; the chat's model picker lists
                  models from every configured provider.
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
                <ul className="space-y-2">
                  {connections.map((connection) => {
                    const option = getProviderOption(connection.provider);

                    return (
                      <li
                        key={connection.provider}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${getProviderLabel(
                            connection.provider,
                          )} key`}
                          onClick={() =>
                            setRemovingProvider(connection.provider)
                          }
                        >
                          <IconTrash className="size-3.5" />
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-xl border p-6">
              <div className="space-y-4">
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
        open={removingProvider !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRemovingProvider(null);
          }
        }}
      >
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title className="flex items-center gap-2">
              {removingProvider && (
                <ProviderIcon provider={removingProvider} className="size-5" />
              )}
              Remove{' '}
              {removingProvider ? getProviderLabel(removingProvider) : ''} key
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

                if (removingProvider) {
                  void removeConnection({
                    variables: { provider: removingProvider },
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
