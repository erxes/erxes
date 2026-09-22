import { ClientPortalUsersDelete } from '@/contacts/client-portal-users/components/client-portal-users-command-bar/delete/ClientPortalUsersDelete';
import { ICPUser } from '@/contacts/client-portal-users/types/cpUser';
import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { Can } from 'ui-modules';

/** Shows bulk actions for selected client portal users. */
export const ClientPortalUsersCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const cpUserIds = selectedRows.map((row: Row<ICPUser>) => row.original._id);

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Can action="clientPortalManage">
          <>
            <Separator.Inline />
            <ClientPortalUsersDelete cpUserIds={cpUserIds} />
          </>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
