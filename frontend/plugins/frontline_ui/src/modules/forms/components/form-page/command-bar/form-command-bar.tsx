import { Row } from '@tanstack/table-core';
import { CommandBar, RecordTable, Separator } from 'erxes-ui';
import { FormDelete } from './delete/form-delete';
import { FormStatusToggle } from './status/form-status-toggle';
import { useTranslation } from 'react-i18next';
import { MoveToChannelCommandBarButton } from '@/channels/components/move-resources/MoveToChannelCommandBarButton';
import { ChannelResourceType } from '@/channels/types';
import { IForm } from '@/forms/types/formTypes';

export const FormCommandBar = () => {
  const { t } = useTranslation('frontline');
  const { table } = RecordTable.useRecordTable();

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const formIds = selectedRows.map((row: Row<IForm>) => row.original._id);
  const sourceChannelIds = selectedRows.map(
    (row: Row<IForm>) => row.original.channelId || '',
  );

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('n-selected', '{{count}} selected', {
            count: selectedRows.length,
          })}
        </CommandBar.Value>
        <Separator.Inline />
        <FormDelete formIds={formIds} rows={selectedRows} />
        <FormStatusToggle formIds={formIds} rows={selectedRows} />
        <MoveToChannelCommandBarButton
          resourceType={ChannelResourceType.FORM}
          resourceIds={formIds}
          sourceChannelIds={sourceChannelIds}
          onMoved={() => table.resetRowSelection()}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
