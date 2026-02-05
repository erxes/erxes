import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Form,
  Input,
  Label,
  Select,
  Separator,
  Switch,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { IPermissionGroupSchema } from '@/settings/permissions/schemas/permissionGroup';
import { PERMISSION_GROUP_SCHEMA } from '@/settings/permissions/schemas/permissionGroup';
import { useGetPermissionModules } from '@/settings/permissions/hooks/useGetPermissionModules';
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

function isActionEnabled(
  perm: IPermissionGroupPermission | undefined,
  actionName: string,
) {
  if (!perm) return false;
  return perm.actions.includes('*') || perm.actions.includes(actionName);
}

export const PermissionGroupForm = ({
  onSubmit,
}: {
  onSubmit: (data: IPermissionGroupSchema) => void;
}) => {
  const { permissionModulesByPlugin } = useGetPermissionModules();

  const form = useForm<IPermissionGroupSchema>({
    resolver: zodResolver(PERMISSION_GROUP_SCHEMA),
    defaultValues: {
      name: '',
      description: '',
      permissions: [],
    },
  });

  const permissions = form.watch('permissions');

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

    if (newActions.length === 0) {
      form.setValue(
        'permissions',
        current.filter(
          (p) => p.module !== module.name,
        ) as IPermissionGroupSchema['permissions'],
      );
    } else {
      const updated = current.map((p) =>
        p.module === module.name ? { ...p, actions: newActions } : p,
      );
      form.setValue(
        'permissions',
        updated as IPermissionGroupSchema['permissions'],
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
      current.map((p) =>
        p.module === moduleName ? { ...p, scope } : p,
      ) as IPermissionGroupSchema['permissions'],
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Form.Field
          control={form.control}
          name="name"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Name</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="description"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Description</Form.Label>
              <Form.Control>
                <Input {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Separator className="my-4" />
        <div className="space-y-4">
          {permissionModulesByPlugin.map((plugin) => (
            <div key={plugin.plugin} className="space-y-2">
              <h3 className="text-sm font-medium capitalize text-muted-foreground">
                {plugin.plugin}
              </h3>
              <div className="flex flex-col gap-2 pl-2">
                {plugin.modules.map((module) => {
                  const moduleOn = isModuleEnabled(module.name);
                  const perm = getPermission(permissions, module.name);
                  return (
                    <div
                      key={module.name}
                      className="rounded-md border px-3 py-2 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{module.name}</p>
                          {module.description && (
                            <p className="text-xs text-muted-foreground">
                              {module.description}
                            </p>
                          )}
                        </div>
                        <Switch
                          checked={moduleOn}
                          onCheckedChange={(checked) =>
                            toggleModule(module, checked ?? false)
                          }
                        />
                      </div>
                      {moduleOn && perm && (
                        <div className="border-t pt-3 space-y-3 pl-2">
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
                                  <div>
                                    <span className="text-sm font-medium">
                                      {action.name}
                                    </span>
                                    {action.description && (
                                      <span className="text-xs text-muted-foreground ml-2">
                                        {action.description}
                                      </span>
                                    )}
                                  </div>
                                  <Switch
                                    checked={isActionEnabled(perm, action.name)}
                                    disabled={action.disabled}
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
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <Separator className="my-4" />
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
};
