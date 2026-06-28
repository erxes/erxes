import { IconPlus } from '@tabler/icons-react';

import { Button, CommandBar, RecordTable, Separator } from 'erxes-ui';
import { PrintDocument } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { ByDateDelete } from '~/modules/ebarimt/put-response/put-responses-by-date/components/by-date-command-bar/by-date-delete/ByDateDelete';

export const ByDateCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { t } = useTranslation('mongolian');

  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} {t('selected')}
        </CommandBar.Value>
        <Separator.Inline />
        <ByDateDelete
          byDateIds={table
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
          contentType="core:byDate"
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
