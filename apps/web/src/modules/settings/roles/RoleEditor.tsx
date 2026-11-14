import type { PermissionInfo, Role } from '@erxes/core-contract';
import { IconLock, IconTrash } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge, Button, Checkbox, cn, Input, Textarea, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '~/lib/api';

const groupsOf = (catalog: PermissionInfo[]) => {
  const groups = new Map<string, PermissionInfo[]>();

  for (const permission of catalog) {
    const key =
      permission.source === 'core'
        ? permission.group
        : `${permission.group} · ${permission.source}`;

    groups.set(key, [...(groups.get(key) ?? []), permission]);
  }

  return [...groups.entries()];
};

/** Unsaved edits; anything not edited shows the role as saved. */
type Draft = { name?: string; description?: string; granted?: Set<string> };

const useRoleMutations = (role: Role, onSaved: () => void) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });
  const { toast } = useToast();
  const client = useQueryClient();

  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: orpc.roles.key() }),
      // My own permissions may have changed.
      client.invalidateQueries({ queryKey: orpc.auth.me.key() }),
    ]);

  const onError = (error: Error) =>
    toast({
      variant: 'destructive',
      title: t('failed', 'Could not save the role'),
      description: messageOf(error),
    });

  const save = useMutation(
    orpc.roles.update.mutationOptions({
      onSuccess: () => {
        onSaved();
        toast({ title: t('saved', 'Role saved') });

        return refresh();
      },
      onError,
    }),
  );

  const remove = useMutation(orpc.roles.remove.mutationOptions({ onSuccess: refresh, onError }));

  return { save, remove, removeRole: () => remove.mutate({ key: role.key }) };
};

const PermissionList = ({
  catalog,
  granted,
  editable,
  onToggle,
}: {
  catalog: PermissionInfo[];
  granted: Set<string>;
  editable: boolean;
  onToggle: (action: string, on: boolean) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });

  return (
    <div className="space-y-5">
      {groupsOf(catalog).map(([group, permissions]) => (
        <section key={group}>
          <h3 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {group}
          </h3>
          <ul className="space-y-1.5">
            {permissions.map((permission) => (
              <li key={permission.action}>
                <label
                  className={cn(
                    'flex items-start gap-3 text-sm',
                    editable && !permission.ownerOnly && 'cursor-pointer',
                  )}
                >
                  <Checkbox
                    className="mt-0.5"
                    checked={granted.has(permission.action)}
                    disabled={!editable || permission.ownerOnly}
                    onCheckedChange={(on) => onToggle(permission.action, on)}
                  />
                  <span className="flex-1">
                    {permission.label}
                    {permission.ownerOnly && (
                      <Badge variant="secondary" className="ml-2">
                        {t('owner-only', 'Owner only')}
                      </Badge>
                    )}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">
                      {permission.action}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

const RoleTitle = ({ role }: { role: Role }) => (
  <>
    <h2 className="flex items-center gap-2 text-base font-medium">
      {role.name}
      {!role.editable && <IconLock className="size-4 text-muted-foreground" />}
    </h2>
    {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
  </>
);

const EverythingNote = ({ owner }: { owner: boolean }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });

  return (
    <p className="rounded-md border bg-muted/40 p-3 text-sm">
      {owner
        ? t(
            'owner-everything',
            'Owners can do everything, including owner-only actions (plugins, audit retention).',
          )
        : t(
            'admin-everything',
            'Admins can do everything except owner-only actions — including whatever plugins add later.',
          )}
    </p>
  );
};

const RoleNameFields = ({
  name,
  description,
  onChange,
}: {
  name: string;
  description: string;
  onChange: (change: { name?: string; description?: string }) => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });

  return (
    <>
      <Input
        value={name}
        onChange={(event) => onChange({ name: event.target.value })}
        text="title"
        aria-label={t('name', 'Name')}
        maxLength={60}
      />
      <Textarea
        value={description}
        onChange={(event) => onChange({ description: event.target.value })}
        placeholder={t('description-placeholder', 'What is this role for?')}
        aria-label={t('description-placeholder', 'What is this role for?')}
        maxLength={300}
        rows={2}
      />
    </>
  );
};

/** One role: name, description and its permissions, as a checklist by area. */
export const RoleEditor = ({
  role,
  catalog,
  canManage,
}: {
  role: Role;
  catalog: PermissionInfo[];
  canManage: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });
  const [draft, setDraft] = useState<Draft>({});
  const { save, remove, removeRole } = useRoleMutations(role, () => setDraft({}));
  const name = draft.name ?? role.name;
  const description = draft.description ?? role.description ?? '';
  const granted = draft.granted ?? new Set(role.permissions);
  const everything = role.permissions.includes('*') || role.key === 'owner';
  const editable = canManage && role.editable;

  const dirty =
    name !== role.name ||
    (description || null) !== role.description ||
    granted.size !== role.permissions.length ||
    role.permissions.some((action) => !granted.has(action));

  const toggle = (action: string, on: boolean) => {
    const next = new Set(granted);

    if (on) next.add(action);
    else next.delete(action);

    setDraft({ ...draft, granted: next });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          {editable ? (
            <RoleNameFields
              name={name}
              description={description}
              onChange={(change) => setDraft({ ...draft, ...change })}
            />
          ) : (
            <RoleTitle role={role} />
          )}
        </div>
        {editable && (
          <div className="flex gap-2">
            {!role.builtin && (
              <Button
                variant="ghost"
                disabled={remove.isPending}
                aria-label={t('delete', 'Delete')}
                onClick={removeRole}
              >
                <IconTrash />
              </Button>
            )}
            <Button
              disabled={!dirty || save.isPending || !name.trim()}
              onClick={() =>
                save.mutate({
                  key: role.key,
                  name,
                  description: description || null,
                  permissions: [...granted],
                })
              }
            >
              {t('save', 'Save')}
            </Button>
          </div>
        )}
      </div>

      {everything ? (
        <EverythingNote owner={role.key === 'owner'} />
      ) : (
        <PermissionList catalog={catalog} granted={granted} editable={editable} onToggle={toggle} />
      )}
    </div>
  );
};
