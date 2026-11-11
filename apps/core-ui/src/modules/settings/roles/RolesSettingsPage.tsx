import type { PermissionInfo, Role } from '@erxes/core-contract';
import { IconLock, IconPlus, IconShieldHalf, IconTrash } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Checkbox, cn, Input, PageContainer, ScrollArea, Spinner, Textarea, useToast } from 'erxes-ui';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { api, messageOf } from '~/lib/api';
import { SESSION_KEY, useCan } from '~/modules/auth/session';
import { ROLES_KEY } from './useRoles';

const groupsOf = (catalog: PermissionInfo[]) => {
  const groups = new Map<string, PermissionInfo[]>();

  for (const permission of catalog) {
    const key = permission.source === 'core' ? permission.group : `${permission.group} · ${permission.source}`;

    groups.set(key, [...(groups.get(key) ?? []), permission]);
  }

  return [...groups.entries()];
};

/** One role: name, description and its permissions, as a checklist by area. */
const RoleEditor = ({ role, catalog, canManage }: { role: Role; catalog: PermissionInfo[]; canManage: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });
  const { toast } = useToast();
  const client = useQueryClient();
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description ?? '');
  const [granted, setGranted] = useState(new Set(role.permissions));
  const everything = role.permissions.includes('*') || role.key === 'owner';
  const editable = canManage && role.editable;

  useEffect(() => {
    setName(role.name);
    setDescription(role.description ?? '');
    setGranted(new Set(role.permissions));
  }, [role]);

  const refresh = () => {
    void client.invalidateQueries({ queryKey: ROLES_KEY });
    // My own permissions may have changed.
    void client.invalidateQueries({ queryKey: SESSION_KEY });
  };
  const onError = (error: unknown) => toast({ variant: 'destructive', title: t('failed', 'Could not save the role'), description: messageOf(error) });
  const save = useMutation({
    mutationFn: () => api.roles.update({ key: role.key, name, description: description || null, permissions: [...granted] }),
    onSuccess: () => {
      refresh();
      toast({ title: t('saved', 'Role saved') });
    },
    onError,
  });
  const remove = useMutation({ mutationFn: () => api.roles.remove({ key: role.key }), onSuccess: refresh, onError });
  const dirty =
    name !== role.name ||
    (description || null) !== role.description ||
    granted.size !== role.permissions.length ||
    role.permissions.some((action) => !granted.has(action));

  const toggle = (action: string, on: boolean) =>
    setGranted((current) => {
      const next = new Set(current);

      if (on) next.add(action);
      else next.delete(action);

      return next;
    });

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          {editable ? (
            <>
              <Input value={name} onChange={(event) => setName(event.target.value)} className="text-base font-medium" maxLength={60} />
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t('description-placeholder', 'What is this role for?')}
                maxLength={300}
                rows={2}
              />
            </>
          ) : (
            <>
              <h2 className="flex items-center gap-2 text-base font-medium">
                {role.name}
                {!role.editable && <IconLock className="size-4 text-muted-foreground" />}
              </h2>
              {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
            </>
          )}
        </div>
        {editable && (
          <div className="flex gap-2">
            {!role.builtin && (
              <Button variant="ghost" disabled={remove.isPending} onClick={() => remove.mutate()}>
                <IconTrash />
              </Button>
            )}
            <Button disabled={!dirty || save.isPending || !name.trim()} onClick={() => save.mutate()}>
              {t('save', 'Save')}
            </Button>
          </div>
        )}
      </div>

      {everything ? (
        <p className="rounded-md border bg-muted/40 p-3 text-sm">
          {role.key === 'owner'
            ? t('owner-everything', 'Owners can do everything, including owner-only actions (plugins, audit retention).')
            : t('admin-everything', 'Admins can do everything except owner-only actions — including whatever plugins add later.')}
        </p>
      ) : (
        <div className="space-y-5">
          {groupsOf(catalog).map(([group, permissions]) => (
            <section key={group}>
              <h3 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{group}</h3>
              <ul className="space-y-1.5">
                {permissions.map((permission) => (
                  <li key={permission.action}>
                    <label className={cn('flex items-start gap-3 text-sm', editable && !permission.ownerOnly && 'cursor-pointer')}>
                      <Checkbox
                        className="mt-0.5"
                        checked={granted.has(permission.action)}
                        disabled={!editable || permission.ownerOnly}
                        onCheckedChange={(on) => toggle(permission.action, on === true)}
                      />
                      <span className="flex-1">
                        {permission.label}
                        {permission.ownerOnly && (
                          <Badge variant="secondary" className="ml-2 font-normal">
                            {t('owner-only', 'Owner only')}
                          </Badge>
                        )}
                        <span className="ml-2 font-mono text-xs text-muted-foreground">{permission.action}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Settings › Roles: what each role may do. Owner and Admin are fixed
 * (everything / everything but owner-only actions); Member and custom roles
 * are checklists of actions — core's and the installed plugins'.
 */
export const RolesSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });
  const can = useCan();
  const client = useQueryClient();
  const { toast } = useToast();
  const roles = useQuery({ queryKey: ROLES_KEY, queryFn: () => api.roles.list() });
  const catalog = useQuery({ queryKey: ['permissions'], queryFn: () => api.roles.permissions() });
  const [selected, setSelected] = useState<string>('member');
  const create = useMutation({
    mutationFn: () => api.roles.create({ name: t('new-role', 'New role'), permissions: ['contacts.view'] }),
    onSuccess: (role) => {
      void client.invalidateQueries({ queryKey: ROLES_KEY });
      setSelected(role.key);
    },
    onError: (error) => toast({ variant: 'destructive', title: t('failed', 'Could not save the role'), description: messageOf(error) }),
  });
  const role = useMemo(() => roles.data?.data.find((item) => item.key === selected) ?? roles.data?.data[0], [roles.data, selected]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb items={[{ label: t('title', 'Roles'), to: '/settings/roles', icon: IconShieldHalf }]} />
        </PageHeader.Start>
        <PageHeader.End>
          {can('roles.manage') && (
            <Button disabled={create.isPending} onClick={() => create.mutate()}>
              <IconPlus />
              {t('create', 'New role')}
            </Button>
          )}
        </PageHeader.End>
      </PageHeader>
      {roles.isLoading || catalog.isLoading ? (
        <Spinner containerClassName="py-12" />
      ) : (
        <div className="flex min-h-0 flex-1">
          <ul className="w-64 shrink-0 space-y-0.5 border-r p-2">
            {roles.data?.data.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => setSelected(item.key)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-muted',
                    item.key === role?.key && 'bg-muted font-medium',
                  )}
                >
                  <span className="truncate">{item.name}</span>
                  <span className="text-xs text-muted-foreground">{item.members}</span>
                </button>
              </li>
            ))}
          </ul>
          <ScrollArea className="flex-1">
            <div className="max-w-3xl p-6">
              {role && catalog.data && <RoleEditor key={role.key} role={role} catalog={catalog.data.data} canManage={can('roles.manage')} />}
            </div>
          </ScrollArea>
        </div>
      )}
    </PageContainer>
  );
};
