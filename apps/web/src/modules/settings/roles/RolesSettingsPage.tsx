import { paths } from '~/lib/paths';
import type { PermissionInfo, Role } from '@erxes/core-contract';
import { IconPlus, IconShieldHalf } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, cn, PageContainer, PageHeader, ScrollArea, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { QueryState } from '~/components/QueryState';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { useCan } from '~/modules/auth/session';
import { RoleEditor } from './RoleEditor';
import { rolesQuery } from './useRoles';

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
  const can = useCan();
  const role = roles.find((item) => item.key === selected) ?? roles[0];

  return (
    <div className="flex min-h-0 flex-1">
      <ul className="w-64 shrink-0 space-y-0.5 border-r p-2">
        {roles.map((item) => (
          <li key={item.key}>
            <button
              type="button"
              onClick={() => onSelect(item.key)}
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
          {role && (
            <RoleEditor
              key={role.key}
              role={role}
              catalog={catalog}
              canManage={can('roles.manage')}
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
 * are checklists of actions — core's and the installed plugins'.
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
