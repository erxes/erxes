import type { PermissionInfo, Role, RoleReach } from '@erxes/core-contract';
import { IconLock } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Input, Textarea, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { PermissionBrowser } from './PermissionBrowser';
import { countGranted, outsideReach } from './permissionSections';
import { DeleteRole, SaveBar } from './RoleActions';
import { RoleReachField } from './RoleReachField';
import { useRoleText } from './useRoles';

/** Unsaved edits; anything not edited shows the role as saved. */
type Draft = { name?: string; description?: string; reach?: RoleReach; granted?: Set<string> };

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

  return { save, removeRole: () => remove.mutate({ key: role.key }) };
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

/** How many permissions and fields differ from the saved role. */
const changesOf = (
  role: Role,
  edited: { name: string; description: string; reach: RoleReach; granted: Set<string> },
) => {
  const saved = new Set(role.permissions);

  const toggled =
    [...edited.granted].filter((action) => !saved.has(action)).length +
    role.permissions.filter((action) => !edited.granted.has(action)).length;

  return (
    toggled +
    Number(edited.name !== role.name) +
    Number((edited.description || null) !== role.description) +
    Number(edited.reach !== role.reach)
  );
};

const RoleSummary = ({
  role,
  catalog,
  granted,
  everything,
}: {
  role: Role;
  catalog: PermissionInfo[];
  granted: Set<string>;
  everything: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });
  const actions = catalog.map((permission) => permission.action);

  return (
    <p className="text-xs text-muted-foreground">
      {everything
        ? t('summary-everything', 'Every permission')
        : t('summary', '{{granted}} of {{total}} permissions', {
            granted: countGranted(actions, granted),
            total: actions.length,
          })}
      {' · '}
      {t('members', '{{count}} members', { count: role.members })}
    </p>
  );
};

/**
 * The role as it is being edited: its saved values under the unsaved edits, and the ways to
 * change them. `shown` is the role in the member's language.
 */
const useRoleDraft = (
  shown: Role,
  catalog: PermissionInfo[],
  onDirtyChange: (dirty: boolean) => void,
) => {
  const [draft, setDraftState] = useState<Draft>({});
  const name = draft.name ?? shown.name;
  const description = draft.description ?? shown.description ?? '';
  const reach = draft.reach ?? shown.reach;
  const granted = draft.granted ?? new Set(shown.permissions);

  const setDraft = (next: Draft) => {
    setDraftState(next);
    onDirtyChange(Object.keys(next).length > 0);
  };

  const toggle = (actions: string[], on: boolean) => {
    const next = new Set(granted);

    for (const action of actions) {
      if (on) next.add(action);
      else next.delete(action);
    }

    setDraft({ ...draft, granted: next });
  };

  /** A narrower reach takes out the actions that work across the whole organisation. */
  const setReach = (next: RoleReach) => {
    const blocked = outsideReach(catalog, next);

    setDraft({
      ...draft,
      reach: next,
      granted: new Set([...granted].filter((action) => !blocked.has(action))),
    });
  };

  return {
    draft,
    name,
    description,
    reach,
    granted,
    changes: changesOf(shown, { name, description, reach, granted }),
    setDraft,
    toggle,
    setReach,
  };
};

/** One role: name, description, reach and its permissions, by source and area. */
export const RoleEditor = ({
  role,
  catalog,
  canManage,
  onDirtyChange,
}: {
  role: Role;
  catalog: PermissionInfo[];
  canManage: boolean;
  onDirtyChange: (dirty: boolean) => void;
}) => {
  // Shown in the member's language; saved as stored unless the member edits it.
  const shown = useRoleText()(role);

  const { draft, name, description, reach, granted, changes, setDraft, toggle, setReach } =
    useRoleDraft(shown, catalog, onDirtyChange);

  const everything = role.permissions.includes('*') || role.key === 'owner';
  const editable = canManage && role.editable;
  const { save, removeRole } = useRoleMutations(role, () => setDraft({}));

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2">
          {editable ? (
            <RoleNameFields
              name={name}
              description={description}
              onChange={(change) => setDraft({ ...draft, ...change })}
            />
          ) : (
            <RoleTitle role={shown} />
          )}
          <RoleSummary role={role} catalog={catalog} granted={granted} everything={everything} />
        </div>
        {editable && !role.builtin && <DeleteRole role={role} onRemove={removeRole} />}
      </div>

      {everything ? (
        <EverythingNote owner={role.key === 'owner'} />
      ) : (
        <>
          <RoleReachField value={reach} editable={editable} onChange={setReach} />
          <PermissionBrowser
            catalog={catalog}
            granted={granted}
            editable={editable}
            blocked={outsideReach(catalog, reach)}
            onChange={toggle}
          />
        </>
      )}

      {editable && changes > 0 && (
        <SaveBar
          changes={changes}
          saving={save.isPending}
          canSave={!save.isPending && Boolean(name.trim())}
          onDiscard={() => setDraft({})}
          onSave={() =>
            save.mutate({
              key: role.key,
              name: draft.name ?? role.name,
              description:
                draft.description === undefined ? role.description : draft.description || null,
              permissions: [...granted],
              reach,
            })
          }
        />
      )}
    </div>
  );
};
