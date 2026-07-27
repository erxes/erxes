import { IconTrash } from '@tabler/icons-react';

import {
  Button,
  CommandBar,
  Separator,
  useConfirm,
  RecordTable,
} from 'erxes-ui';
import { useRemoveBranch } from '../../hooks/useBranchActions';
import { Can } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const BranchesCommandBar = () => {
  const { t } = useTranslation('settings');
  const { table } = RecordTable.useRecordTable();
  const { handleRemove } = useRemoveBranch();
  const { confirm } = useConfirm();

  const confirmOptions = { confirmationValue: 'delete' };

  const onRemove = () => {
    const ids: string[] =
      table.getSelectedRowModel().rows?.map((row) => row.original._id) || [];

    confirm({
      message: t('remove-selected-confirm', 'Are you sure you want to remove the selected?'),
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
        <Can action="branchesManage">
          <Button variant="secondary" onClick={onRemove}>
            <IconTrash />
            {t('delete', 'Delete')}
          </Button>
        </Can>
      </CommandBar.Bar>
    </CommandBar>
  );
};
