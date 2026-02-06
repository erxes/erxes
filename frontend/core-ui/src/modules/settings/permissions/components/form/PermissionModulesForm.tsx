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

  const isModuleEnabled = (module: IPermissionModule) =>
    module.always || permissions.some((p) => p.module === module.name);

  const toggleModule = (module: IPermissionModule, enabled: boolean) => {
    if (module.always && !enabled) return;
    const current = form.getValues('permissions');
    if (enabled) {
      form.setValue('permissions', [
        ...current,
        {
          module: module.name,
          actions: ['*'],
          scope: 'all',
        },
      ]);
    } else {
      if (module.always) return;
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
    let current = form.getValues('permissions');
    let perm = getPermission(current, module.name);
    if (!perm && module.always) {
      form.setValue('permissions', [
        ...current,
        { module: module.name, actions: ['*'], scope: 'all' },
      ]);
      current = form.getValues('permissions');
      perm = getPermission(current, module.name);
    }
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
    const existing = current.find((p) => p.module === moduleName);
    if (existing) {
      form.setValue(
        'permissions',
        current.map((p) => (p.module === moduleName ? { ...p, scope } : p)),
      );
    } else {
      form.setValue('permissions', [
        ...current,
        { module: moduleName, actions: ['*'], scope },
      ]);
    }
  };

  return (
    <div className="flex flex-1 h-full min-w-0">
      <Sidebar.Content className="flex-1 shrink-0 min-w-0 w-44 border-r border-border/60 bg-sidebar/50">
        <Sidebar.Group className="px-2">
          <Sidebar.GroupLabel className="text-xs font-medium uppercase tracking-wider text-muted-foreground/90">
            Plugins
          </Sidebar.GroupLabel>
          <Sidebar.GroupContent className="mt-2 space-y-0.5">
            <Sidebar.Menu>
              {permissionModulesByPlugin.map(({ plugin }) => (
                <Sidebar.MenuItem key={plugin}>
                  <Sidebar.MenuButton
                    type="button"
                    isActive={selectedPlugin === plugin}
                    onClick={() => setSelectedPlugin(plugin)}
                    className="rounded-lg capitalize transition-colors"
                  >
                    {plugin}
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              ))}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>
      <div className="flex-1 min-w-0 overflow-auto">
        {selectedPluginData ? (
          <div className="p-5 space-y-3">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-foreground capitalize">
                {selectedPluginData.plugin}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure module permissions and scopes
              </p>
            </div>
            <div className="space-y-2">
              {selectedPluginData.modules.map((module) => {
                const moduleOn = isModuleEnabled(module);
                const perm = getPermission(permissions, module.name);
                const permOrDefault: IPermissionGroupPermission | undefined =
                  perm ??
                  (module.always
                    ? { module: module.name, actions: ['*'], scope: 'all' }
                    : undefined);
                return (
                  <Collapsible
                    key={module.name}
                    className="group rounded-xl border border-border/80 bg-card shadow-sm overflow-hidden transition-shadow hover:shadow-md"
                    defaultOpen
                  >
                    <Collapsible.Trigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 h-auto py-3.5 px-4 rounded-none hover:bg-muted/50 rounded-t-xl data-[state=open]:rounded-b-none"
                      >
                        <Collapsible.TriggerIcon className="text-muted-foreground size-4 shrink-0 transition-transform group-data-[state=open]:rotate-90" />
                        <span className="flex flex-1 items-center justify-between gap-3 min-w-0 text-left">
                          <span className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-medium text-foreground truncate">
                              {module.name}
                            </span>
                            {module.description && (
                              <span className="text-xs text-muted-foreground truncate">
                                {module.description}
                              </span>
                            )}
                          </span>
                          <span
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 shrink-0"
                          >
                            {module.always && (
                              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded">
                                Always
                              </span>
                            )}
                            <Switch
                              checked={moduleOn}
                              disabled={module.always}
                              onCheckedChange={(checked) =>
                                toggleModule(module, checked ?? false)
                              }
                              className="data-[state=checked]:bg-primary"
                            />
                          </span>
                        </span>
                      </Button>
                    </Collapsible.Trigger>
                    <Collapsible.Content>
                      {moduleOn && permOrDefault && (
                        <div className="border-t border-border/60 bg-muted/20 px-4 py-4 space-y-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <Label className="text-xs font-medium text-muted-foreground shrink-0">
                              Scope
                            </Label>
                            <Select
                              value={permOrDefault.scope}
                              onValueChange={(value) =>
                                setModuleScope(
                                  module.name,
                                  value as IPermissionGroupPermission['scope'],
                                )
                              }
                            >
                              <Select.Trigger className="h-9 w-[130px] rounded-lg border-border/80 bg-background shadow-xs">
                                <Select.Value />
                              </Select.Trigger>
                              <Select.Content className="rounded-lg">
                                {SCOPES.map((s) => (
                                  <Select.Item key={s.value} value={s.value}>
                                    {s.label}
                                  </Select.Item>
                                ))}
                              </Select.Content>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground">
                              Actions
                            </Label>
                            <div className="flex flex-col gap-1.5">
                              {module.actions.map((action) => (
                                <div
                                  key={action.name}
                                  className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/80 px-3 py-2.5 transition-colors hover:bg-muted/30"
                                >
                                  <div className="min-w-0 flex-1">
                                    <span className="text-sm font-medium text-foreground">
                                      {action.name}
                                    </span>
                                    {action.always && (
                                      <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                        (always)
                                      </span>
                                    )}
                                    {action.description && (
                                      <span className="mt-0.5 block text-xs text-muted-foreground truncate">
                                        {action.description}
                                      </span>
                                    )}
                                  </div>
                                  <Switch
                                    checked={isActionEnabled(
                                      permOrDefault,
                                      action,
                                    )}
                                    disabled={action.disabled || action.always}
                                    onCheckedChange={(checked) =>
                                      toggleAction(
                                        module,
                                        action.name,
                                        checked ?? false,
                                      )
                                    }
                                    className="shrink-0 data-[state=checked]:bg-primary"
                                  />
                                </div>
                              ))}
                            </div>
                            {permOrDefault.actions.includes('*') && (
                              <p className="text-xs text-muted-foreground pt-1">
                                All actions selected
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
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Select a plugin
            </p>
            <p className="text-xs text-muted-foreground/80 mt-1 max-w-[220px]">
              Choose a plugin from the sidebar to configure its module
              permissions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
