import type { Role } from '@erxes/core-contract';
import { IconTrash } from '@tabler/icons-react';
import { Button, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const DeleteRole = ({ role, onRemove }: { role: Role; onRemove: () => void }) => {
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
export const SaveBar = ({
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
