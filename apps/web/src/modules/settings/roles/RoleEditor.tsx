import type { PermissionInfo, Role } from '@erxes/core-contract';
import { IconLock, IconTrash } from '@tabler/icons-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Input, Textarea, useConfirm, useToast } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { messageOf, orpc } from '@erxes/core-contract/client';
import { PermissionBrowser } from './PermissionBrowser';
import { countGranted } from './permissionSections';

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

const DeleteRole = ({ role, onRemove }: { role: Role; onRemove: () => void }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });
  const { confirm } = useConfirm();

  const inUse = role.members > 0;

  const label = inUse
    ? t('delete-in-use', 'Give its {{count}} members another role before deleting it', {
        count: role.members,
      })
    : t('delete', 'Delete');

  return (
    <Button
      variant="ghost"
      tone="muted"
      size="icon"
      disabled={inUse}
      aria-label={label}
      title={label}
      onClick={() =>
        void confirm({
          message: t('delete-confirm', 'Delete the role “{{name}}”?', { name: role.name }),
          options: { okLabel: t('delete', 'Delete'), variants: { ok: 'destructive' } },
        }).then(onRemove)
      }
    >
      <IconTrash />
    </Button>
  );
};

/** Pinned under the list while the role has unsaved edits. */
const SaveBar = ({
  changes,
  saving,
  canSave,
  onDiscard,
  onSave,
}: {
  changes: number;
  saving: boolean;
  canSave: boolean;
  onDiscard: () => void;
  onSave: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'roles' });

  return (
    <div className="sticky bottom-0 z-10 -mx-6 -mb-6 flex items-center gap-3 border-t bg-background/95 px-6 py-3 backdrop-blur">
      <span className="flex-1 text-sm text-muted-foreground">
        {t('unsaved', '{{count}} unsaved changes', { count: changes })}
      </span>
      <Button variant="ghost" disabled={saving} onClick={onDiscard}>
        {t('discard', 'Discard')}
      </Button>
      <Button disabled={!canSave} onClick={onSave}>
        {t('save', 'Save')}
      </Button>
    </div>
  );
};

/** How many permissions and fields differ from the saved role. */
const changesOf = (role: Role, name: string, description: string, granted: Set<string>) => {
  const saved = new Set(role.permissions);

  const toggled =
    [...granted].filter((action) => !saved.has(action)).length +
    role.permissions.filter((action) => !granted.has(action)).length;

  return toggled + Number(name !== role.name) + Number((description || null) !== role.description);
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

/** One role: name, description and its permissions, by source and area. */
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
  const [draft, setDraftState] = useState<Draft>({});
  const name = draft.name ?? role.name;
  const description = draft.description ?? role.description ?? '';
  const granted = draft.granted ?? new Set(role.permissions);
  const everything = role.permissions.includes('*') || role.key === 'owner';
  const editable = canManage && role.editable;
  const changes = changesOf(role, name, description, granted);

  const setDraft = (next: Draft) => {
    setDraftState(next);
    onDirtyChange(Object.keys(next).length > 0);
  };

  const { save, removeRole } = useRoleMutations(role, () => setDraft({}));

  const toggle = (actions: string[], on: boolean) => {
    const next = new Set(granted);

    for (const action of actions) {
      if (on) next.add(action);
      else next.delete(action);
    }

    setDraft({ ...draft, granted: next });
  };

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
            <RoleTitle role={role} />
          )}
          <RoleSummary role={role} catalog={catalog} granted={granted} everything={everything} />
        </div>
        {editable && !role.builtin && <DeleteRole role={role} onRemove={removeRole} />}
      </div>

      {everything ? (
        <EverythingNote owner={role.key === 'owner'} />
      ) : (
        <PermissionBrowser
          catalog={catalog}
          granted={granted}
          editable={editable}
          onChange={toggle}
        />
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
              name,
              description: description || null,
              permissions: [...granted],
            })
          }
        />
      )}
    </div>
  );
};
