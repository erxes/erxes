import { Cell } from '@tanstack/react-table';
import { Popover, RecordTable } from 'erxes-ui';
import { PrintDocument } from 'ui-modules';
import { IDuplicated } from '~/modules/ebarimt/put-response/put-responses-duplicated/types/DuplicatedType';

export const DuplicatedMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IDuplicated, unknown>;
}) => {
  const row = cell.row.original;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Popover.Content className="p-0 w-auto" align="start">
        <PrintDocument items={[row]} contentType="core:duplicated" />
      </Popover.Content>
    </Popover>
  );
};

export const duplicatedMoreColumn = {
  id: 'more',
  cell: DuplicatedMoreColumnCell,
  size: 33,
};
