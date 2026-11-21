import { paths } from '~/lib/paths';
import type { PermissionInfo, Role } from '@erxes/core-contract';
import { IconLock, IconPlus, IconShieldHalf, IconUsers } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, cn, PageContainer, PageHeader, ScrollArea, useConfirm, useToast } from 'erxes-ui';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useCan } from '~/modules/auth/session';
import { RoleEditor } from './RoleEditor';
import { rolesQuery, useRoleText } from './useRoles';

const RoleList = ({
  roles,
  selected,
  onSelect,
}: {
  roles: Role[];
  selected: string | undefined;
  onSelect: (key: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });
  const roleText = useRoleText();

  return (
    <div className="flex w-64 shrink-0 border-r">
      <ScrollArea className="flex-1" fitWidth>
        <nav aria-label={t('title', 'Roles')} className="space-y-0.5 p-2">
          {roles.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-current={item.key === selected ? 'page' : undefined}
              onClick={() => onSelect(item.key)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted',
                item.key === selected && 'bg-muted font-medium',
              )}
            >
              <span className="flex-1 truncate">{roleText(item).name}</span>
              {!item.editable && (
                <IconLock
                  className="size-3.5 shrink-0 text-muted-foreground"
                  aria-label={t('fixed', 'Fixed')}
                />
              )}
              <span
                className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground tabular-nums"
                title={t('members', '{{count}} members', { count: item.members })}
              >
                <IconUsers className="size-3" aria-hidden />
                {item.members}
              </span>
            </button>
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
};

const RolesView = ({
  roles,
  catalog,
  selected,
  onSelect,
}: {
  roles: Role[];
  catalog: PermissionInfo[];
  selected: string;
  onSelect: (key: string) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });
  const can = useCan();
  const { confirm } = useConfirm();
  const dirty = useRef(false);
  const role = roles.find((item) => item.key === selected) ?? roles[0];

  const select = (key: string) => {
    if (key === role?.key) return;

    if (!dirty.current) return onSelect(key);

    void confirm({
      message: t('leave-confirm', 'Discard your unsaved changes?'),
      options: { okLabel: t('discard', 'Discard'), variants: { ok: 'destructive' } },
    }).then(() => {
      dirty.current = false;

      return onSelect(key);
    });
  };

  return (
    <div className="flex min-h-0 flex-1">
      <RoleList roles={roles} selected={role?.key} onSelect={select} />
      <ScrollArea className="flex-1">
        <div className="mx-auto max-w-4xl px-6 pt-6">
          {role && (
            <RoleEditor
              key={role.key}
              role={role}
              catalog={catalog}
              canManage={can('roles.manage')}
              onDirtyChange={(next) => {
                dirty.current = next;
              }}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

/**
 * Settings › Roles: what each role may do. Owner and Admin are fixed
 * (everything / everything but owner-only actions); Member and custom roles
 * are checklists of actions — core's and the installed plugins', one foldable section each.
 */
export const RolesSettingsPage = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });
  const can = useCan();
  const client = useQueryClient();
  const { toast } = useToast();
  const roles = useQuery(rolesQuery());
  const catalog = useQuery(orpc.roles.permissions.queryOptions());
  const [selected, setSelected] = useState<string>('member');

  const create = useMutation(
    orpc.roles.create.mutationOptions({
      onSuccess: (role) => {
        setSelected(role.key);

        return client.invalidateQueries({ queryKey: orpc.roles.key() });
      },
      onError: (error) =>
        toast({
          variant: 'destructive',
          title: t('failed', 'Could not save the role'),
          description: messageOf(error),
        }),
    }),
  );

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[{ label: t('title', 'Roles'), to: paths.settings.roles, icon: IconShieldHalf }]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          {can('roles.manage') && (
            <Button
              disabled={create.isPending}
              onClick={() =>
                create.mutate({ name: t('new-role', 'New role'), permissions: ['contacts.view'] })
              }
            >
              <IconPlus />
              {t('create', 'New role')}
            </Button>
          )}
        </PageHeader.End>
      </PageHeader>
      <QueryState query={roles} className="py-12">
        {({ data }) => (
          <QueryState query={catalog} className="py-12">
            {(permissions) => (
              <RolesView
                roles={data}
                catalog={permissions.data}
                selected={selected}
                onSelect={setSelected}
              />
            )}
          </QueryState>
        )}
      </QueryState>
    </PageContainer>
  );
};
