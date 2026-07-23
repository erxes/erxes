import { Cell, ColumnDef } from '@tanstack/react-table';
import {
  Combobox,
  Command,
  Popover,
  RecordTable,
  useQueryState,
} from 'erxes-ui';
import {
  IconArchive,
  IconArrowBack,
  IconCopy,
  IconEdit,
} from '@tabler/icons-react';
import { useDealsCopy, useDealsEdit } from '@/deals/cards/hooks/useDeals';

import { IDeal } from '@/deals/types/deals';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const DealsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IDeal, unknown>;
}) => {
  const { _id, status } = cell.row.original;
  const { t } = useTranslation('sales');
  const setActiveDealId = useSetAtom(dealDetailSheetState);
  const [, setSalesItemId] = useQueryState<string>('salesItemId');
  const { editDeals } = useDealsEdit();
  const { copyDeals, loading: copyLoading } = useDealsCopy();
  const [menuOpen, setMenuOpen] = useState(false);

  const isArchived = status === 'archived';

  const runAction = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  const onEdit = () => {
    setSalesItemId(_id);
    setActiveDealId(_id);
  };

  const onCopy = () => {
    copyDeals({ variables: { _id } });
  };

  const onArchive = () => {
    editDeals({
      variables: { _id, status: isArchived ? 'active' : 'archived' },
    });
  };

  return (
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item value="edit" onSelect={() => runAction(onEdit)}>
              <IconEdit /> {t('edit')}
            </Command.Item>
            <Command.Item
              disabled={copyLoading}
              value="copy"
              onSelect={() => runAction(onCopy)}
            >
              <IconCopy /> {t('copy')}
            </Command.Item>
            <Command.Item value="archive" onSelect={() => runAction(onArchive)}>
              {isArchived ? (
                <>
                  <IconArrowBack /> {t('unarchive')}
                </>
              ) : (
                <>
                  <IconArchive /> {t('archive')}
                </>
              )}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const dealsMoreColumn: ColumnDef<IDeal> = {
  id: 'more',
  size: 33,
  cell: DealsMoreColumnCell,
  header: () => <RecordTable.ColumnSelector />,
};
