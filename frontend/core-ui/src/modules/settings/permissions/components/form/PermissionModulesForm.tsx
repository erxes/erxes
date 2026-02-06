import { useGetPermissionModules } from '@/settings/permissions/hooks/useGetPermissionModules';
import { UseFormReturn } from 'react-hook-form';
import { IPermissionGroupSchema } from '@/settings/permissions/schemas/permissionGroup';
import { Button, Collapsible, Label, Select, Sidebar, Switch } from 'erxes-ui';
import { useState } from 'react';
import {
  IPermissionModule,
  IPermissionGroupPermission,
} from '@/settings/permissions/types';

const SCOPES: { value: IPermissionGroupPermission['scope']; label: string }[] =
  [
    { value: 'own', label: 'Own' },
    { value: 'group', label: 'Group' },
    { value: 'all', label: 'All' },
  ];

function getPermission(
  permissions: IPermissionGroupPermission[],
  moduleName: string,
) {
  return permissions.find((p) => p.module === moduleName);
}

function getAlwaysActionNames(module: IPermissionModule): string[] {
  return module.actions.filter((a) => a.always).map((a) => a.name);
}

function isActionEnabled(
  perm: IPermissionGroupPermission | undefined,
  action: { name: string; always?: boolean },
) {
  if (action.always) return true;
  if (!perm) return false;
  return perm.actions.includes('*') || perm.actions.includes(action.name);
}

export const PermissionModulesForm = ({
  form,
}: {
  form: UseFormReturn<IPermissionGroupSchema>;
}) => {
  const { permissionModulesByPlugin } = useGetPermissionModules();
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null);
  const permissions = form.watch('permissions');

  const selectedPluginData = permissionModulesByPlugin.find(
    (p) => p.plugin === selectedPlugin,
  );

  const isModuleEnabled = (moduleName: string) =>
    permissions.some((p) => p.module === moduleName);

  const toggleModule = (module: IPermissionModule, enabled: boolean) => {
    const current = form.getValues('permissions');
    if (enabled) {
      form.setValue('permissions', [
        ...current,
        { module: module.name, actions: ['*'], scope: 'all' },
      ]);
    } else {
      form.setValue(
        'permissions',
        current.filter((p) => p.module !== module.name),
      );
    }
  };

  const toggleAction = (
    module: IPermissionModule,
    actionName: string,
    enabled: boolean,
  ) => {
    const current = form.getValues('permissions');
    const perm = getPermission(current, module.name);
    if (!perm) return;

    const alwaysNames = getAlwaysActionNames(module);
    const actionDef = module.actions.find((a) => a.name === actionName);
    if (actionDef?.always && !enabled) return;

    const allActionNames = module.actions.map((a) => a.name).filter(Boolean);
    let newActions: string[];

    if (perm.actions.includes('*')) {
      if (enabled) {
        newActions = ['*'];
      } else {
        newActions = allActionNames.filter((a) => a !== actionName);
      }
    } else {
      if (enabled) {
        newActions = [
          ...perm.actions.filter((a) => a !== actionName),
          actionName,
        ];
        if (newActions.length === allActionNames.length) {
          newActions = ['*'];
        }
      } else {
        newActions = perm.actions.filter((a) => a !== actionName);
      }
    }

    newActions = [...new Set([...newActions, ...alwaysNames])];

    if (newActions.length === 0) {
      form.setValue(
        'permissions',
        current.filter((p) => p.module !== module.name),
      );
    } else {
      form.setValue(
        'permissions',
        current.map((p) =>
          p.module === module.name ? { ...p, actions: newActions } : p,
        ),
      );
    }
  };

  const setModuleScope = (
    moduleName: string,
    scope: IPermissionGroupPermission['scope'],
  ) => {
    const current = form.getValues('permissions');
    form.setValue(
      'permissions',
      current.map((p) => (p.module === moduleName ? { ...p, scope } : p)),
    );
  };

  return (
    <div className="flex-auto flex h-full min-w-0">
      <Sidebar.Content className="flex-1 shrink-0 min-w-0 border-r">
        <Sidebar.Group>
          <Sidebar.GroupLabel>Plugins</Sidebar.GroupLabel>
          <Sidebar.GroupContent className="mt-2">
            <Sidebar.Menu>
              {permissionModulesByPlugin.map(({ plugin }) => (
                <Sidebar.MenuItem key={plugin}>
                  <Sidebar.MenuButton
                    type="button"
                    isActive={selectedPlugin === plugin}
                    onClick={() => setSelectedPlugin(plugin)}
                  >
                    {plugin}
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              ))}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>
      <div className="flex-2 min-w-0 p-4 overflow-auto">
        {selectedPluginData ? (
          <div className="space-y-2">
            <h3 className="text-sm font-medium capitalize text-muted-foreground mb-3">
              {selectedPluginData.plugin} — Modules
            </h3>
            {selectedPluginData.modules.map((module) => {
              const moduleOn = isModuleEnabled(module.name);
              const perm = getPermission(permissions, module.name);
              return (
                <Collapsible key={module.name} className="group" defaultOpen>
                  <div className="relative rounded-md border">
                    <Collapsible.Trigger asChild>
                      <Button
                        variant="secondary"
                        className="w-full justify-start rounded-md h-auto py-3 px-3"
                      >
                        <Collapsible.TriggerIcon />
                        <span className="flex flex-1 items-center justify-between gap-2 min-w-0">
                          <span className="text-left truncate">
                            {module.name}
                            {module.description && (
                              <span className="text-muted-foreground font-normal block text-xs truncate">
                                {module.description}
                              </span>
                            )}
                          </span>
                          <span onClick={(e) => e.stopPropagation()}>
                            <Switch
                              checked={moduleOn}
                              onCheckedChange={(checked) =>
                                toggleModule(module, checked ?? false)
                              }
                            />
                          </span>
                        </span>
                      </Button>
                    </Collapsible.Trigger>
                  </div>
                  <Collapsible.Content className="pt-2">
                    {moduleOn && perm && (
                      <div className="rounded-md border border-t-0 rounded-t-none px-3 py-3 space-y-3 bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs text-muted-foreground shrink-0">
                            Scope
                          </Label>
                          <Select
                            value={perm.scope}
                            onValueChange={(value) =>
                              setModuleScope(
                                module.name,
                                value as IPermissionGroupPermission['scope'],
                              )
                            }
                          >
                            <Select.Trigger className="h-8 w-[120px]">
                              <Select.Value />
                            </Select.Trigger>
                            <Select.Content>
                              {SCOPES.map((s) => (
                                <Select.Item key={s.value} value={s.value}>
                                  {s.label}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Actions
                          </Label>
                          <div className="flex flex-col gap-1.5">
                            {module.actions.map((action) => (
                              <div
                                key={action.name}
                                className="flex items-center justify-between rounded border px-2 py-1.5"
                              >
                                <div className="min-w-0">
                                  <span className="text-sm font-medium">
                                    {action.name}
                                  </span>
                                  {action.always && (
                                    <span className="text-xs text-muted-foreground ml-2">
                                      (always)
                                    </span>
                                  )}
                                  {action.description && (
                                    <span className="text-xs text-muted-foreground ml-2 block truncate">
                                      {action.description}
                                    </span>
                                  )}
                                </div>
                                <Switch
                                  checked={isActionEnabled(perm, action)}
                                  disabled={action.disabled || action.always}
                                  onCheckedChange={(checked) =>
                                    toggleAction(
                                      module,
                                      action.name,
                                      checked ?? false,
                                    )
                                  }
                                />
                              </div>
                            ))}
                          </div>
                          {perm.actions.includes('*') && (
                            <p className="text-xs text-muted-foreground">
                              All actions selected (*)
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </Collapsible.Content>
                </Collapsible>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Select a plugin to configure permissions
          </div>
        )}
      </div>
    </div>
  );
};
