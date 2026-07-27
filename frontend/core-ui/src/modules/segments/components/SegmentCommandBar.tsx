import { Row } from '@tanstack/table-core';
import { CommandBar, Separator } from 'erxes-ui/components';
import { RecordTable } from 'erxes-ui/modules/record-table';
import { useTranslation } from 'react-i18next';
import { ISegment } from 'ui-modules';
import { SegmentRemoveButtonCommandBar } from './SegmentsRemoveButton';

export const SegmentCommandBar = () => {
  const { t } = useTranslation('segment');
  const { table } = RecordTable.useRecordTable();

  const segmentIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row: Row<ISegment>) => row.original._id);

  const isSelected = table.getFilteredSelectedRowModel().rows.length > 0;

  return (
    <CommandBar open={isSelected}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {t('selected', '{{total}} selected', { total: table.getFilteredSelectedRowModel().rows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <SegmentRemoveButtonCommandBar
          segmentIds={segmentIds}
          rows={table.getFilteredSelectedRowModel().rows}
        />
      </CommandBar.Bar>
    </CommandBar>
  );
};
