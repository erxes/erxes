import { useTranslation } from 'react-i18next';
import { IconTrash } from '@tabler/icons-react';
import {
  Button,
  CommandBar,
  RecordTable,
  Separator,
  useConfirm,
} from 'erxes-ui';
import { Can } from 'ui-modules';
import { useUomsRemove } from '../../hooks/useUomsRemove';

export const UomsCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { t } = useTranslation('product', { keyPrefix: 'uoms' });
  const { removeUoms } = useUomsRemove();
  const confirmOptions = { confirmationValue: 'delete' };

  const handleDelete = () => {
    const selectedIds = table
      .getFilteredSelectedRowModel()
      .rows.map((row) => row.original._id);

    confirm({
      message: t('confirm-delete-selected', { count: selectedIds.length }),
      options: confirmOptions,
    }).then(() => {
      removeUoms({
        variables: { uomIds: selectedIds },
        onCompleted: () => {
          table.resetRowSelection();
        },
      });
    });
  };

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('selected', {
            count: table.getFilteredSelectedRowModel().rows.length,
          })}
        </CommandBar.Value>
        <Separator.Inline />
        <Can action="uomsManage">
          <Button
            variant="secondary"
            className="text-destructive"
            onClick={handleDelete}
          >
            <IconTrash />
            {t('delete')}
          </Button>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
