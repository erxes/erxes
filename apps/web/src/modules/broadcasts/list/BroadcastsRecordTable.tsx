import type { Broadcast } from '@erxes/core-contract';
import { IconTrash } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CursorRecordTable } from '~/components/CursorRecordTable';
import { EmptyList } from '~/components/EmptyList';
import { useSelectedRows } from '~/components/useSelectedRows';
import { useCan } from '~/modules/auth/session';
import { NoBroadcasts } from './NoBroadcasts';
import { useBroadcastsColumns } from './broadcastsColumns';
import { useBroadcastRowActions } from './useBroadcastRowActions';
import { useBroadcasts, useBroadcastsFilters } from './useBroadcastsList';

/** What can be done to the selected rows, at the bottom of the screen. */
const BroadcastsCommandBar = ({ rows }: { rows: Broadcast[] }) => {
  const { t } = useTranslation('broadcasts');
  const { table } = RecordTable.useRecordTable();
  const selected = useSelectedRows(rows);
  const manage = useCan()('broadcasts.manage');
  const { remove, pending } = useBroadcastRowActions();

  return (
    <CommandBar open={selected.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('list.selected', '{{count}} selected', { count: selected.length })}
        </CommandBar.Value>
        {manage && (
          <>
            <Separator.Inline />
            <Button
              variant="secondary"
              tone="destructive"
              disabled={pending}
              onClick={() => void remove(selected, () => table.setRowSelection({}))}
            >
              <IconTrash />
              {t('remove', 'Delete')}
            </Button>
          </>
        )}
      </CommandBar.Bar>
    </CommandBar>
  );
};

/** The broadcasts as a record table: open one by its name, select rows to delete them. */
export const BroadcastsRecordTable = () => {
  const cursor = useBroadcasts();
  const { shared, dates } = useBroadcastsFilters();
  const filtered = Boolean(shared.search || shared.status || shared.channel || dates);

  return (
    <CursorRecordTable
      cursor={cursor}
      columns={useBroadcastsColumns()}
      stickyColumns={['more', 'checkbox', 'name']}
      tableId="broadcasts_record_table"
      empty={filtered ? <EmptyList /> : <NoBroadcasts />}
    >
      <BroadcastsCommandBar rows={cursor.list} />
    </CursorRecordTable>
  );
};
