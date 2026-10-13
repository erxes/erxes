import { IconArchive, IconArchiveOff, IconEdit } from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useConfirm,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  useLoyaltyAccountTypeArchive,
  useLoyaltyAccountTypeUnarchive,
} from '../hooks/useLoyaltyAccountTypeMutations';
import { ILoyaltyAccountType } from '../types';

export const LoyaltyAccountTypeMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ILoyaltyAccountType, unknown>;
}) => {
  const { t } = useTranslation('loyalty');
  const { _id, name, status } = cell.row.original;
  const [, setEditAccountId] = useQueryState<string>(
    'editLoyaltyAccountTypeId',
  );
  const { confirm } = useConfirm();
  const { run: archive } = useLoyaltyAccountTypeArchive();
  const { run: unarchive } = useLoyaltyAccountTypeUnarchive();

  const onArchive = () =>
    confirm({
      message: t('loyalty-account-type-archive-confirm', { name }),
    }).then(() => archive({ _id }));

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content
        align="start"
        className="w-[220px] min-w-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Command>
          <Command.List>
            <Command.Item value="edit" onSelect={() => setEditAccountId(_id)}>
              <IconEdit /> {t('edit')}
            </Command.Item>
            {status === 'archived' ? (
              <Command.Item value="restore" onSelect={() => unarchive({ _id })}>
                <IconArchiveOff /> {t('restore')}
              </Command.Item>
            ) : (
              <Command.Item value="archive" onSelect={onArchive}>
                <IconArchive /> {t('archive')}
              </Command.Item>
            )}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const loyaltyAccountTypeMoreColumn = {
  id: 'more',
  cell: LoyaltyAccountTypeMoreColumnCell,
  size: 33,
  minSize: 33,
  maxSize: 33,
};
