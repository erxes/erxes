import { useMutation, useQuery } from '@apollo/client';
import { PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import {
  Badge,
  Breadcrumb,
  Button,
  Card,
  Input,
  Label,
  Separator,
  Sheet,
  Skeleton,
  Spinner,
  Switch,
  useConfirm,
  useToast,
} from 'erxes-ui';
import {
  IconPackage,
  IconPlus,
  IconPuzzle,
  IconTrash,
} from '@tabler/icons-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MARKETPLACE_CATALOG_ERROR,
  MARKETPLACE_GITHUB_INSTALL_ENABLED,
  MARKETPLACE_INSTALLED_PLUGINS,
  MARKETPLACE_PLUGINS,
} from '../graphql/queries';
import {
  MARKETPLACE_PLUGIN_INSTALL,
  MARKETPLACE_PLUGIN_SET_ENABLED,
  MARKETPLACE_PLUGIN_UNINSTALL,
} from '../graphql/mutations';
import {
  IGithubInstallEnabledData,
  IInstalledPluginsData,
  IInstalledPlugin,
  IMarketplaceCatalogErrorData,
  IMarketplacePlugin,
  IMarketplacePluginsData,
} from '../types';

const REFETCH = [MARKETPLACE_PLUGINS, MARKETPLACE_INSTALLED_PLUGINS];

const useMarketplaceActions = () => {
  const { toast } = useToast();
  const onError = (error: { message: string }) =>
    toast({
      title: 'Marketplace error',
      description: error.message,
      variant: 'destructive',
    });

  const [install, { loading: installing }] = useMutation<
    { marketplacePluginInstall: IInstalledPlugin },
    { name?: string; repoUrl?: string }
  >(MARKETPLACE_PLUGIN_INSTALL, {
    refetchQueries: REFETCH,
    onCompleted: () =>
      toast({
        variant: 'success',
        title: 'Plugin installed',
        description: 'Reload the page to load its interface.',
      }),
    onError,
  });

  const [setEnabled] = useMutation(MARKETPLACE_PLUGIN_SET_ENABLED, {
    refetchQueries: REFETCH,
    onCompleted: () => toast({ variant: 'success', title: 'Plugin updated' }),
    onError,
  });

  const [uninstall] = useMutation(MARKETPLACE_PLUGIN_UNINSTALL, {
    refetchQueries: REFETCH,
    onCompleted: () =>
      toast({ variant: 'success', title: 'Plugin uninstalled' }),
    onError,
  });

  return { install, setEnabled, uninstall, installing };
};

const AddPluginSheet = ({
  onInstall,
  loading,
}: {
  onInstall: (repoUrl: string) => Promise<boolean>;
  loading: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');

  const submit = async () => {
    const installed = await onInstall(repoUrl.trim());

    if (installed) {
      setOpen(false);
      setRepoUrl('');
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          Add plugin
        </Button>
      </Sheet.Trigger>
      <Sheet.View>
        <Sheet.Header>
          <Sheet.Title>Install plugin from GitHub</Sheet.Title>
          <Sheet.Description>
            The repository must contain a plugin.json manifest at its root.
          </Sheet.Description>
        </Sheet.Header>
        <Sheet.Content>
          <div className="flex flex-col gap-2 py-4">
            <Label htmlFor="plugin-repo-url">Repository URL</Label>
            <Input
              id="plugin-repo-url"
              placeholder="https://github.com/owner/my-erxes-plugin"
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
            />
          </div>
        </Sheet.Content>
        <Sheet.Footer>
          <Button disabled={!repoUrl.trim() || loading} onClick={submit}>
            {loading && <Spinner size="sm" />}
            Install
          </Button>
        </Sheet.Footer>
      </Sheet.View>
    </Sheet>
  );
};

const PluginCard = ({
  plugin,
  install,
  onInstall,
  onSetEnabled,
  onUninstall,
  busy,
}: {
  plugin: IMarketplacePlugin;
  install?: IInstalledPlugin;
  onInstall: (name: string) => void;
  onSetEnabled: (id: string, enabled: boolean) => void;
  onUninstall: (id: string, name: string) => void;
  busy: boolean;
}) => {
  return (
    <Card className="flex flex-col p-4 gap-3">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-9 rounded-md border bg-muted">
          <IconPuzzle size={20} />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold">{plugin.name}</span>
          <span className="text-xs text-muted-foreground">
            {plugin.version || 'latest'}
          </span>
        </div>
        {plugin.installed && (
          <Badge variant={plugin.enabled ? 'success' : 'secondary'}>
            {plugin.enabled ? 'Installed' : 'Disabled'}
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground min-h-10">
        {plugin.description || 'No description provided.'}
      </p>
      <Separator />
      <div className="flex items-center justify-between">
        {plugin.installed && install ? (
          <>
            <div className="flex items-center gap-2">
              <Switch
                checked={plugin.enabled}
                disabled={busy}
                onCheckedChange={(checked) =>
                  onSetEnabled(install._id, checked)
                }
              />
              <Label className="text-sm">Enabled</Label>
            </div>
            <Button
              variant="ghost"
              size="icon"
              disabled={busy}
              onClick={() => onUninstall(install._id, plugin.name)}
            >
              <IconTrash size={16} />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            disabled={busy}
            onClick={() => onInstall(plugin.name)}
          >
            {busy && <Spinner size="sm" />}
            Install
          </Button>
        )}
      </div>
    </Card>
  );
};

export const MarketplaceSettings = () => {
  const { confirm } = useConfirm();
  const {
    data: catalogData,
    loading: catalogLoading,
    error: catalogError,
  } = useQuery<IMarketplacePluginsData>(MARKETPLACE_PLUGINS);
  const { data: catalogStatusData } = useQuery<IMarketplaceCatalogErrorData>(
    MARKETPLACE_CATALOG_ERROR,
  );
  const { data: installsData } = useQuery<IInstalledPluginsData>(
    MARKETPLACE_INSTALLED_PLUGINS,
  );
  const { data: githubInstallData } = useQuery<IGithubInstallEnabledData>(
    MARKETPLACE_GITHUB_INSTALL_ENABLED,
  );

  const { install, setEnabled, uninstall, installing } =
    useMarketplaceActions();

  // The plugin name (catalog install) or install _id (toggle/uninstall)
  // currently being mutated — only that card is disabled/spinning.
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const installsByName = new Map(
    (installsData?.marketplaceInstalledPlugins || []).map((entry) => [
      entry.name,
      entry,
    ]),
  );

  const plugins = catalogData?.marketplacePlugins || [];

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeaderStart>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" asChild>
                  <Link to="/marketplace">
                    <IconPackage />
                    Marketplace
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeaderStart>
        <PageHeaderEnd>
          {!!githubInstallData?.marketplaceGithubInstallEnabled && (
            <AddPluginSheet
              loading={installing}
              onInstall={async (repoUrl) => {
                const result = await install({
                  variables: { repoUrl },
                }).catch(() => null);
                return !!result?.data?.marketplacePluginInstall;
              }}
            />
          )}
        </PageHeaderEnd>
      </PageHeader>
      <div className="flex-1 overflow-auto p-4">
        {catalogError && (
          <p className="text-sm text-destructive pb-4">
            Could not load the plugin catalog: {catalogError.message}
          </p>
        )}
        {!catalogError && catalogStatusData?.marketplaceCatalogError && (
          <p className="text-sm text-destructive pb-4">
            Plugin catalog is unreachable — showing installed plugins only:{' '}
            {catalogStatusData.marketplaceCatalogError}
          </p>
        )}
        {catalogLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-40" />
            ))}
          </div>
        ) : plugins.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
            <IconPackage size={32} />
            <p>
              No plugins available.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {plugins.map((plugin) => {
              const installRecord = installsByName.get(plugin.name);
              const busy =
                busyKey === plugin.name ||
                (!!installRecord && busyKey === installRecord._id);

              return (
                <PluginCard
                  key={plugin.name}
                  plugin={plugin}
                  install={installRecord}
                  busy={busy}
                  onInstall={(name) => {
                    setBusyKey(name);
                    install({ variables: { name } })
                      .catch(() => undefined)
                      .finally(() => setBusyKey(null));
                  }}
                  onSetEnabled={(id, enabled) => {
                    setBusyKey(id);
                    setEnabled({ variables: { _id: id, enabled } })
                      .catch(() => undefined)
                      .finally(() => setBusyKey(null));
                  }}
                  onUninstall={(id, name) =>
                    confirm({
                      message: `Are you sure you want to uninstall "${name}"?`,
                    }).then(() => {
                      setBusyKey(id);
                      return uninstall({ variables: { _id: id } })
                        .catch(() => undefined)
                        .finally(() => setBusyKey(null));
                    })
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
