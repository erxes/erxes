import { IconArchive, IconRestore, IconTrash } from '@tabler/icons-react';
import { DropdownMenu, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/** Archive, or Restore while archived: a data model menu's item for an object, field or group. */
export const ArchiveItem = ({
  archived,
  onArchive,
  onRestore,
}: {
  archived: boolean;
  onArchive: () => void;
  onRestore: () => void;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'fields' });

  return (
    <DropdownMenu.Item onClick={archived ? onRestore : onArchive}>
      {archived ? <IconRestore /> : <IconArchive />}
      {archived ? t('restore', 'Restore') : t('archive', 'Archive')}
    </DropdownMenu.Item>
  );
};

/** Delete, after the member confirms `message`. */
export const RemoveItem = ({ message, onRemove }: { message: string; onRemove: () => void }) => {
  const { t } = useTranslation('data', { keyPrefix: 'fields' });
  const { confirm } = useConfirm();

  return (
    <DropdownMenu.Item
      variant="destructive"
      onClick={() =>
        void confirm({ message, options: { variants: { ok: 'destructive' } } }).then(onRemove)
      }
    >
      <IconTrash />
      {t('remove', 'Delete')}
    </DropdownMenu.Item>
  );
};
