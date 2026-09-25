import { Cell } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';
import { BroadcastActionsMenu } from '../BroadcastActionsMenu';

export const BroadcastMoreCell = ({ cell }: { cell: Cell<any, unknown> }) => (
  <BroadcastActionsMenu
    campaign={cell.row.original}
    trigger={<RecordTable.MoreButton className="w-full h-full" />}
  />
);
