import { IconLock, IconShield } from '@tabler/icons-react';
import { Button, Collapsible, Dialog, Separator, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useGetPermissionModules } from '@/settings/permissions/hooks/useGetPermissionModules';
import {
  IDefaultPermissionGroup,
  IPermissionGroup,
  IPermissionModule,
  IPermissionGroupPermission,
} from '@/settings/permissions/types';

interface Props {
  group: IDefaultPermissionGroup | IPermissionGroup;
  isDefault?: boolean;
  trigger?: React.ReactNode;
}

interface IGroupedByPlugin {
  [plugin: string]: {
    module: IPermissionModule;
    permission: IPermissionGroupPermission;
  }[];
}

function createFallbackModule(perm: IPermissionGroupPermission): {
  module: IPermissionModule;
  plugin: string;
} {
  const plugin = perm.plugin || 'other';
  return {
    plugin,
    module: {
      name: perm.module,
      plugin,
      scopes: [],
      actions: [],
    },
  };
}

export const PermissionGroupDetails = ({
  group,
  isDefault,
  trigger,
}: Props) => {
  const [open, setOpen] = useState(false);
  const { permissionModulesByPlugin, loading: modulesLoading } =
    useGetPermissionModules();

  const getModuleInfo = (
    moduleName: string,
  ): { module: IPermissionModule; plugin: string } | null => {
    for (const pluginData of permissionModulesByPlugin) {
      const found = pluginData.modules.find((m) => m.name === moduleName);
      if (found) return { module: found, plugin: pluginData.plugin };
    }
    return null;
  };

  const permissions: IPermissionGroupPermission[] = Array.isArray(
    group.permissions,
  )
    ? group.permissions
    : [];

  const groupedByPlugin: IGroupedByPlugin = {};

  for (const perm of permissions) {
    const resolved = getModuleInfo(perm.module) ?? createFallbackModule(perm);
    const { module, plugin } = resolved;

    if (!groupedByPlugin[plugin]) {
      groupedByPlugin[plugin] = [];
    }
    groupedByPlugin[plugin].push({ module, permission: perm });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            View
          </Button>
        )}
      </Dialog.Trigger>
      <Dialog.Content className="max-w-2xl h-[85vh] flex flex-col p-0">
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              {isDefault ? (
                <IconLock size={18} className="text-muted-foreground" />
              ) : (
                <IconShield size={18} className="text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{group.name}</h2>
                {isDefault && (
                  <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    Default
                  </span>
                )}
              </div>
              {group.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {group.description}
                </p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 styled-scroll">
          {modulesLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : permissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-muted-foreground font-medium">
                No permissions configured
              </p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                This group has no module permissions assigned
              </p>
            </div>
          ) : (
            Object.entries(groupedByPlugin).map(([plugin, items]) => (
              <Collapsible key={plugin} defaultOpen>
                <Collapsible.Trigger asChild>
                  <Button
                    variant="ghost"
                    className="group w-full justify-start px-4 py-2.5 bg-muted/30 hover:bg-muted/50 rounded-lg"
                  >
                    <Collapsible.TriggerIcon className="mr-2 shrink-0 transition-transform duration-200 ease-out" />
                    <span className="font-medium text-sm">{plugin}</span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {items.length} {items.length === 1 ? 'module' : 'modules'}
                    </span>
                  </Button>
                </Collapsible.Trigger>

                <Collapsible.Content className="pt-3 space-y-3">
                  {items.map(({ module, permission }) => {
                    const scopeDescription = module.scopes?.find(
                      (s) => s.name === permission.scope,
                    )?.description;

                    return (
                      <div
                        key={permission.module}
                        className="rounded-lg border border-border overflow-hidden"
                      >
                        <div className="px-4 py-3 bg-muted/20">
                          <p className="font-medium capitalize text-foreground">
                            {module.name}
                          </p>
                          {module.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">
                              {module.description}
                            </p>
                          )}
                        </div>
                        {scopeDescription && (
                          <div className="px-4 py-2 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                              {scopeDescription}
                            </p>
                          </div>
                        )}

                        <div className="divide-y divide-border">
                          {(module.actions ?? []).length > 0
                            ? (module.actions ?? []).map((action) => {
                                const hasPermission =
                                  permission.actions.includes('*') ||
                                  permission.actions.includes(action.name);

                                return (
                                  <div
                                    key={action.name}
                                    className={`flex items-center justify-between px-4 py-2.5 ${
                                      hasPermission
                                        ? 'bg-background'
                                        : 'bg-muted/5 opacity-70'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      {action.always && (
                                        <IconLock
                                          size={12}
                                          className="text-muted-foreground shrink-0"
                                        />
                                      )}
                                      <div className="min-w-0">
                                        <p
                                          className={`text-sm ${
                                            hasPermission
                                              ? 'text-foreground'
                                              : 'text-muted-foreground'
                                          }`}
                                        >
                                          {action.title || action.name}
                                        </p>
                                        {action.description && (
                                          <p className="text-xs text-muted-foreground">
                                            {action.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <span
                                      className={`text-xs shrink-0 ml-2 ${
                                        hasPermission
                                          ? 'text-success'
                                          : 'text-muted-foreground'
                                      }`}
                                    >
                                      {hasPermission ? 'Yes' : 'No'}
                                    </span>
                                  </div>
                                );
                              })
                            : permission.actions.length > 0 && (
                                <div className="px-4 py-2.5 text-sm text-muted-foreground">
                                  {permission.actions.join(', ')}
                                </div>
                              )}
                        </div>
                      </div>
                    );
                  })}
                </Collapsible.Content>
              </Collapsible>
            ))
          )}
        </div>

        <Separator />

        <div className="px-6 py-4 flex justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
