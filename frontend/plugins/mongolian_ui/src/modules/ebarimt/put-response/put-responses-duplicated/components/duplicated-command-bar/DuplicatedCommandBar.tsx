import { IconPlus } from '@tabler/icons-react';

import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { PrintDocument } from 'ui-modules';
import { DuplicatedDelete } from '~/modules/ebarimt/put-response/put-responses-duplicated/components/duplicated-command-bar/duplicated-delete/DuplicatedDelete';
import { useTranslation } from 'react-i18next';

export const DuplicatedCommandBar = () => {
  const { t } = useTranslation('mongolian');
  const { table } = RecordTable.useRecordTable();

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} {t('selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <DuplicatedDelete
          duplicatedIds={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original._id)}
        />
        <Separator.Inline />
        <Button variant="secondary">
          <IconPlus />
          {t('create')}
        </Button>

        <PrintDocument
          items={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
          contentType="core:duplicated"
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
