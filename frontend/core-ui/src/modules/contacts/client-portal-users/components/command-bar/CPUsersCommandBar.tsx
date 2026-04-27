import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { ICPUser } from '../../types/cpUser';
import { Can } from 'ui-modules';
import { CPUsersDelete } from './delete/ClientPortalUserDelete';
import { CPUsersVerify } from './verify/CPUsersVerify';

export const CPCommandBar = () => {
  const { table } = RecordTable.useRecordTable();

  const clientIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row: Row<ICPUser>) => row.original._id);

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />

        <CPUsersVerify clientIds={clientIds} type="phone" />

        <Separator.Inline />

        <CPUsersVerify clientIds={clientIds} type="email" />

        <Can action="contactsDelete">
          <>
            <Separator.Inline />
            <CPUsersDelete clientIds={clientIds} />
          </>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
