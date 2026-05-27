import { IconTrash } from '@tabler/icons-react';

import {
  Button,
  CommandBar,
  Separator,
  useConfirm,
  RecordTable,
} from 'erxes-ui';
import { useRemoveDepartment } from '../../hooks/useDepartmentActions';
import { Can } from 'ui-modules';

export const DepartmentsCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { handleRemove } = useRemoveDepartment();
  const { confirm } = useConfirm();

  const confirmOptions = { confirmationValue: 'delete' };

  const onRemove = () => {
    const ids: string[] =
      table.getSelectedRowModel().rows?.map((row) => row.original._id) || [];

    confirm({
      message: 'Are you sure you want to remove the selected?',
      options: confirmOptions,
    }).then(async () => {
      try {
        handleRemove({
          variables: {
            ids,
          },
        });
      } catch (e) {
        console.error(e);
      }
    });
  };

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <Can action="departmentsManage">
          <Button variant="secondary" onClick={onRemove}>
            <IconTrash />
            Delete
          </Button>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
