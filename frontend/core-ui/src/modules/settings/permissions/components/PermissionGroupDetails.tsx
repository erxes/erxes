// PermissionGroupDetails.tsx

import {
  IconLock,
  IconCheck,
  IconX,
  IconShield,
  IconInfoCircle,
  IconPlugConnected,
} from '@tabler/icons-react';
import { Button, Collapsible, Dialog, Separator } from 'erxes-ui';
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

const SCOPE_LABELS: Record<string, { label: string; color: string }> = {
  own: { label: 'Own records', color: 'bg-amber-500/10 text-amber-600' },
  group: { label: 'Team records', color: 'bg-blue-500/10 text-blue-600' },
  all: { label: 'All records', color: 'bg-green-500/10 text-green-600' },
};

interface IGroupedByPlugin {
  [plugin: string]: {
    module: IPermissionModule;
    permission: IPermissionGroupPermission;
  }[];
}

export const PermissionGroupDetails = ({
  group,
  isDefault,
  trigger,
}: Props) => {
  const [open, setOpen] = useState(false);
  const { permissionModulesByPlugin } = useGetPermissionModules();

  const getModuleInfo = (
    moduleName: string,
  ): { module: IPermissionModule; plugin: string } | null => {
    for (const pluginData of permissionModulesByPlugin) {
      const found = pluginData.modules.find((m) => m.name === moduleName);
      if (found) return { module: found, plugin: pluginData.plugin };
    }
    return null;
  };

  const permissions = 'permissions' in group ? group.permissions : [];

  // Group permissions by plugin
  const groupedByPlugin: IGroupedByPlugin = {};

  for (const perm of permissions) {
    const moduleInfo = getModuleInfo(perm.module);
    if (!moduleInfo) continue;

    const { module, plugin } = moduleInfo;

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
      <Dialog.Content className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isDefault ? 'bg-primary/10' : 'bg-green-500/10'
              }`}
            >
              {isDefault ? (
                <IconLock size={22} className="text-primary" />
              ) : (
                <IconShield size={22} className="text-green-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{group.name}</h2>
                {isDefault && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 styled-scroll">
          {permissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 rounded-full bg-muted/30 mb-4">
                <IconShield size={40} className="text-muted-foreground/40" />
              </div>
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
                {/* Plugin Header */}
                <Collapsible.Trigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4 py-3 bg-muted/30 hover:bg-muted/50 rounded-lg"
                  >
                    <Collapsible.TriggerIcon className="mr-2" />
                    <IconPlugConnected
                      size={16}
                      className="mr-2 text-primary"
                    />
                    <span className="font-semibold uppercase tracking-wide text-sm">
                      {plugin}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {items.length} {items.length === 1 ? 'module' : 'modules'}
                    </span>
                  </Button>
                </Collapsible.Trigger>

                <Collapsible.Content className="pt-3 space-y-3">
                  {items.map(({ module, permission }) => {
                    const scopeInfo = SCOPE_LABELS[permission.scope] || {
                      label: permission.scope,
                      color: 'bg-muted text-muted-foreground',
                    };
                    const scopeDescription = module.scopes?.find(
                      (s) => s.name === permission.scope,
                    )?.description;

                    return (
                      <div
                        key={permission.module}
                        className="rounded-xl border border-border overflow-hidden"
                      >
                        {/* Module Header */}
                        <div className="flex items-center justify-between px-5 py-4 bg-muted/30">
                          <div>
                            <p className="font-semibold capitalize text-foreground">
                              {module.name}
                            </p>
                            {module.description && (
                              <p className="text-sm text-muted-foreground mt-0.5">
                                {module.description}
                              </p>
                            )}
                          </div>
                          <span
                            className={`text-xs font-medium px-3 py-1.5 rounded-full ${scopeInfo.color}`}
                          >
                            {scopeInfo.label}
                          </span>
                        </div>

                        {/* Scope Description */}
                        {scopeDescription && (
                          <div className="px-5 py-3 bg-muted/10 border-b border-border flex items-start gap-2">
                            <IconInfoCircle
                              size={16}
                              className="text-primary shrink-0 mt-0.5"
                            />
                            <p className="text-sm text-muted-foreground">
                              {scopeDescription}
                            </p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="divide-y divide-border">
                          {module.actions.map((action) => {
                            const hasPermission =
                              permission.actions.includes('*') ||
                              permission.actions.includes(action.name);

                            return (
                              <div
                                key={action.name}
                                className={`flex items-center justify-between px-5 py-3 transition-colors ${
                                  hasPermission
                                    ? 'bg-background'
                                    : 'bg-muted/10 opacity-60'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {action.always && (
                                    <IconLock
                                      size={14}
                                      className="text-muted-foreground"
                                    />
                                  )}
                                  <div>
                                    <p
                                      className={`text-sm font-medium ${
                                        hasPermission
                                          ? 'text-foreground'
                                          : 'text-muted-foreground'
                                      }`}
                                    >
                                      {action.title || action.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {action.description}
                                    </p>
                                  </div>
                                </div>
                                {hasPermission ? (
                                  <div className="flex items-center gap-1.5 text-green-500">
                                    <IconCheck size={18} strokeWidth={2.5} />
                                    <span className="text-xs font-medium">
                                      Allowed
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-muted-foreground/50">
                                    <IconX size={18} />
                                    <span className="text-xs">Denied</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
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

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </Dialog.Content>
    </Dialog>
  );
};
