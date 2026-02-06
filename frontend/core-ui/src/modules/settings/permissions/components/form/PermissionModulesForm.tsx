import { useGetPermissionModules } from '@/settings/permissions/hooks/useGetPermissionModules';
import { UseFormReturn } from 'react-hook-form';
import { IPermissionGroupSchema } from '@/settings/permissions/schemas/permissionGroup';
import { Label, Select, Separator, Sidebar, Switch } from 'erxes-ui';
import { useState } from 'react';
import {
  IPermissionModule,
  IPermissionGroupPermission,
} from '@/settings/permissions/types';
import { IconPlugConnected } from '@tabler/icons-react';

const SCOPES: { value: IPermissionGroupPermission['scope']; label: string }[] =
  [
    { value: 'own', label: 'Own' },
    { value: 'group', label: 'Group' },
    { value: 'all', label: 'All' },
  ];

const getPermission = (
  permissions: IPermissionGroupPermission[],
  moduleName: string,
): IPermissionGroupPermission | undefined => {
  return permissions.find((p) => p.module === moduleName);
};

const getAlwaysActionNames = (module: IPermissionModule): string[] => {
  return module.actions.filter((a) => a.always).map((a) => a.name);
};

const isActionEnabled = (
  perm: IPermissionGroupPermission | undefined,
  action: { name: string; always?: boolean },
): boolean => {
  if (action.always) return true;
  if (!perm) return false;
  return perm.actions.includes('*') || perm.actions.includes(action.name);
};

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
    <div className="flex h-full min-w-0">
      <Sidebar.Content className="flex-1 shrink-0 min-w-0 w-52 border-r border-border/60 bg-muted/20">
        <Sidebar.Group className="px-3 py-4">
          <Sidebar.GroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-2">
            Plugins
          </Sidebar.GroupLabel>
          <Sidebar.GroupContent className="space-y-1">
            <Sidebar.Menu>
              {permissionModulesByPlugin.map(({ plugin }) => (
                <Sidebar.MenuItem key={plugin}>
                  <Sidebar.MenuButton
                    type="button"
                    isActive={selectedPlugin === plugin}
                    onClick={() => setSelectedPlugin(plugin)}
                    className="rounded-lg capitalize transition-all duration-150 hover:bg-muted/60 data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
                  >
                    {plugin}
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              ))}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>
      <div className="w-[80%] overflow-auto styled-scroll">
        <div className="mx-auto max-w-3xl px-6">
          {selectedPluginData ? (
            <div className="py-8 space-y-8">
              <div className="border-b border-border/60 pb-5 ">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-foreground capitalize">
                    {selectedPluginData.plugin}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Configure module permissions and access scopes
                </p>
              </div>
              <div className="space-y-4">
                {selectedPluginData.modules.map((module) => {
                  const moduleOn = isModuleEnabled(module);
                  const perm = getPermission(permissions, module.name);
                  const permOrDefault: IPermissionGroupPermission | undefined =
                    perm ??
                    (module.always
                      ? { module: module.name, actions: ['*'], scope: 'all' }
                      : undefined);
                  return (
                    <section
                      key={module.name}
                      className="rounded-xl border border-border/60 bg-card shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between gap-4 px-5 py-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground capitalize">
                              {module.name}
                            </span>
                            {module.always && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                Required
                              </span>
                            )}
                          </div>
                          {module.description && (
                            <p className="text-sm text-muted-foreground">
                              {module.description}
                            </p>
                          )}
                        </div>
                        <Switch
                          checked={moduleOn}
                          disabled={module.always}
                          onCheckedChange={(checked) =>
                            toggleModule(module, checked ?? false)
                          }
                          className="shrink-0 data-[state=checked]:bg-primary"
                        />
                      </div>
                      {moduleOn && permOrDefault && (
                        <>
                          <Separator />
                          <div className="px-5 py-5 space-y-6 bg-muted/5">
                            <div className="flex items-center gap-4 flex-col sm:flex-row">
                              <Label className="text-sm font-medium min-w-[80px]">
                                Access Scope
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
                                <Select.Trigger className="w-min min-w-32 h-7">
                                  <Select.Value />
                                </Select.Trigger>
                                <Select.Content
                                  className="rounded-lg min-w-32"
                                  position="item-aligned"
                                >
                                  {SCOPES.map((s) => (
                                    <Select.Item
                                      key={s.value}
                                      value={s.value}
                                      className="[&_svg]:text-primary"
                                    >
                                      {s.label}
                                    </Select.Item>
                                  ))}
                                </Select.Content>
                              </Select>
                              <p className="text-sm text-muted-foreground max-w-[280px]">
                                {
                                  module.scopes.find(
                                    (s) => s.name === permOrDefault.scope,
                                  )?.description
                                }
                              </p>
                            </div>
                            <div className="space-y-3">
                              <Label className="text-sm font-medium">
                                Allowed Actions
                              </Label>
                              <div className="flex flex-col gap-0.5">
                                {module.actions.map((action) => (
                                  <div
                                    key={action.name}
                                    className="flex items-center justify-between gap-4 rounded-lg py-3 px-3 hover:bg-muted/40 transition-all duration-150 group"
                                  >
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-sm font-medium text-foreground">
                                          {action.description || action.name}
                                        </span>
                                        {action.always && (
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border/40">
                                            Required
                                          </span>
                                        )}
                                      </div>
                                      {action.description && (
                                        <span className="text-xs text-muted-foreground font-normal">
                                          {action.name}
                                        </span>
                                      )}
                                    </div>
                                    <Switch
                                      checked={isActionEnabled(
                                        permOrDefault,
                                        action,
                                      )}
                                      disabled={
                                        action.disabled || action.always
                                      }
                                      onCheckedChange={(checked) =>
                                        toggleAction(
                                          module,
                                          action.name,
                                          checked ?? false,
                                        )
                                      }
                                      className="shrink-0 data-[state=checked]:bg-primary transition-all"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </section>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
                <IconPlugConnected size={32} stroke={1.5} />
              </div>
              <h4 className="text-base font-semibold text-foreground mb-2">
                Select a plugin
              </h4>
              <p className="text-sm text-muted-foreground max-w-[280px]">
                Choose a plugin from the sidebar to configure its module
                permissions and access controls
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
