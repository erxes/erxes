import { Cell } from '@tanstack/react-table';
import { Popover, RecordTable } from 'erxes-ui';
import { PrintDocument } from 'ui-modules';
import { IByDate } from '~/modules/ebarimt/put-response/put-responses-by-date/types/ByDateType';

export const ByDateMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IByDate, unknown>;
}) => {
  const row = cell.row.original;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Popover.Content className="p-0 w-auto" align="start">
        <PrintDocument items={[row]} contentType="core:byDate" />
      </Popover.Content>
    </Popover>
  );
};

export const byDateMoreColumn = {
  id: 'more',
  cell: ByDateMoreColumnCell,
  size: 33,
};
