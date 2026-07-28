import { Cell } from '@tanstack/react-table';
import { IPutResponse } from '~/modules/ebarimt/put-response/types/PutResponseType';
import { Popover, RecordTable } from 'erxes-ui';
import { PrintDocument } from 'ui-modules';

export const PutResponseMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IPutResponse, unknown>;
}) => {
  const row = cell.row.original;

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Popover.Content className="p-0 w-auto" align="start">
        <PrintDocument items={[row]} contentType="core:putresponse" />
      </Popover.Content>
    </Popover>
  );
};

export const putResponseMoreColumn = {
  id: 'more',
  cell: PutResponseMoreColumnCell,
  size: 33,
};
