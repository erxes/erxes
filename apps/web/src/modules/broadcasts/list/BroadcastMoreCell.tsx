import type { Broadcast } from '@erxes/core-contract';
import { IconCopy, IconEdit, IconTrash } from '@tabler/icons-react';
import { Combobox, Command, Popover, RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useCan } from '~/modules/auth/session';
import { isRemovable } from '../broadcastQueries';
import { useBroadcastRowActions } from './useBroadcastRowActions';

/** A row's menu: open it, and for managers duplicate and delete. */
export const BroadcastMoreCell = ({ broadcast }: { broadcast: Broadcast }) => {
  const { t } = useTranslation('broadcasts');
  const manage = useCan()('broadcasts.manage');
  const { open, duplicate, remove } = useBroadcastRowActions();

  return (
    <Popover>
      <Popover.Trigger render={<RecordTable.MoreButton className="h-full w-full" />} />
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="open" onSelect={() => void open(broadcast.id)}>
              <IconEdit /> {t('list.open', 'Open')}
            </Command.Item>
            {manage && (
              <Command.Item value="duplicate" onSelect={() => duplicate(broadcast.id)}>
                <IconCopy /> {t('duplicate', 'Duplicate')}
              </Command.Item>
            )}
            {manage && isRemovable(broadcast.status) && (
              <Command.Item value="remove" onSelect={() => void remove([broadcast])}>
                <IconTrash /> {t('remove', 'Delete')}
              </Command.Item>
            )}
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};
