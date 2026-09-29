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
import { SettingsWorkspacePath } from '@/types/paths/SettingsPath';
import {
  INSTALLED_PLUGINS,
  MARKETPLACE_PLUGINS,
} from '../graphql/queries';
import {
  MARKETPLACE_PLUGIN_INSTALL,
  MARKETPLACE_PLUGIN_SET_ENABLED,
  MARKETPLACE_PLUGIN_UNINSTALL,
} from '../graphql/mutations';
import {
  IInstalledPluginsData,
  IInstalledPlugin,
  IMarketplacePlugin,
  IMarketplacePluginsData,
} from '../types';

const REFETCH = [MARKETPLACE_PLUGINS, INSTALLED_PLUGINS];

const useMarketplaceActions = () => {
  const { toast } = useToast();
  const onError = (error: { message: string }) =>
    toast({
      title: 'Marketplace error',
      description: error.message,
      variant: 'destructive',
    });

  const [install, { loading: installing }] = useMutation(
    MARKETPLACE_PLUGIN_INSTALL,
    {
      refetchQueries: REFETCH,
      onCompleted: () =>
        toast({ variant: 'success', title: 'Plugin installed' }),
      onError,
    },
  );

  const [setEnabled, { loading: toggling }] = useMutation(
    MARKETPLACE_PLUGIN_SET_ENABLED,
    {
      refetchQueries: REFETCH,
      onCompleted: () =>
        toast({ variant: 'success', title: 'Plugin updated' }),
      onError,
    },
  );

  const [uninstall, { loading: uninstalling }] = useMutation(
    MARKETPLACE_PLUGIN_UNINSTALL,
    {
      refetchQueries: REFETCH,
      onCompleted: () =>
        toast({ variant: 'success', title: 'Plugin uninstalled' }),
      onError,
    },
  );

  return { install, setEnabled, uninstall, installing, toggling, uninstalling };
};

const AddPluginSheet = ({
  onInstall,
  loading,
}: {
  onInstall: (repoUrl: string) => void;
  loading: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');

  const submit = () => {
    onInstall(repoUrl.trim());
    setOpen(false);
    setRepoUrl('');
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
  onUninstall: (id: string) => void;
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
          <Badge variant={plugin.enabled ? 'secondary' : 'outline'}>
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
              onClick={() => onUninstall(install._id)}
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
  const {
    data: catalogData,
    loading: catalogLoading,
    error: catalogError,
  } = useQuery<IMarketplacePluginsData>(MARKETPLACE_PLUGINS);
  const { data: installsData } =
    useQuery<IInstalledPluginsData>(INSTALLED_PLUGINS);

  const {
    install,
    setEnabled,
    uninstall,
    installing,
    toggling,
    uninstalling,
  } = useMarketplaceActions();

  const busy = installing || toggling || uninstalling;

  const installsByName = new Map(
    (installsData?.installedPlugins || []).map((entry) => [entry.name, entry]),
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
                  <Link to={`/settings/${SettingsWorkspacePath.Marketplace}`}>
                    <IconPackage />
                    Marketplace
                  </Link>
                </Button>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeaderStart>
        <PageHeaderEnd>
          <AddPluginSheet
            loading={busy}
            onInstall={(repoUrl) =>
              install({ variables: { repoUrl } }).catch(() => undefined)
            }
          />
        </PageHeaderEnd>
      </PageHeader>
      <div className="flex-1 overflow-auto p-4">
        {catalogError && (
          <p className="text-sm text-destructive pb-4">
            Could not load the plugin catalog: {catalogError.message}
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
            <p>No plugins available. Use "Add plugin" to install from GitHub.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {plugins.map((plugin) => (
              <PluginCard
                key={plugin.name}
                plugin={plugin}
                install={installsByName.get(plugin.name)}
                busy={busy}
                onInstall={(name) =>
                  install({ variables: { name } }).catch(() => undefined)
                }
                onSetEnabled={(id, enabled) =>
                  setEnabled({ variables: { _id: id, enabled } }).catch(
                    () => undefined,
                  )
                }
                onUninstall={(id) =>
                  uninstall({ variables: { _id: id } }).catch(() => undefined)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
