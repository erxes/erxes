import {
  IconBuilding,
  IconChartBar,
  IconLabel,
  IconMobiledata,
  IconPhone,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  TextOverflowTooltip,
  RecordTableInlineCell,
  Badge,
} from 'erxes-ui';

import { IPosOrdersByCustomer } from '../types/posOrdersByCustomerType';
import { PosOrdersByCustomerMoreColumn } from './PosOrdersByCustomerMoreColumn';

export const PosOrdersByCustomerColumns: ColumnDef<IPosOrdersByCustomer>[] = [
  PosOrdersByCustomerMoreColumn,
  RecordTable.checkboxColumn as ColumnDef<IPosOrdersByCustomer>,
  {
    id: 'customerType',
    accessorKey: 'customerType',
    header: () => <RecordTable.InlineHead icon={IconLabel} label="Type" />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <TextOverflowTooltip value={cell.getValue() as string} />
        </RecordTableInlineCell>
      );
    },
  },
  // {
  //   id: 'count',
  //   accessorKey: 'count',
  //   header: () => (
  //     <RecordTable.InlineHead icon={IconMobiledata} label="Count" />
  //   ),
  //   cell: ({ cell }) => {
  //     const value = cell.getValue() as boolean;
  //     return (
  //       <RecordTableInlineCell>
  //         <Badge variant={value ? 'success' : 'secondary'}>
  //           {value ? 'Online' : 'Offline'}
  //         </Badge>
  //       </RecordTableInlineCell>
  //     );
  //   },
  // },
  // {
  //   id: 'cashAmount',
  //   accessorKey: 'cashAmount',
  //   header: () => (
  //     <RecordTable.InlineHead icon={IconPhone} label="Cash Amount" />
  //   ),
  //   cell: ({ cell }) => {
  //     const value = cell.getValue() as boolean;
  //     return (
  //       <RecordTableInlineCell>
  //         <Badge variant="default">{value ? 'On Server' : 'Local Only'}</Badge>
  //       </RecordTableInlineCell>
  //     );
  //   },
  // },
  // {
  //   id: 'mobileAmount',
  //   accessorKey: 'mobileAmount',
  //   header: () => (
  //     <RecordTable.InlineHead icon={IconBuilding} label="Mobile Amount" />
  //   ),
  //   cell: ({ cell }) => {
  //     return (
  //       <RecordTableInlineCell>
  //         <TextOverflowTooltip value={cell.getValue() as string} />
  //       </RecordTableInlineCell>
  //     );
  //   },
  // },
  // {
  //   id: 'amount',
  //   accessorKey: 'amount',
  //   header: () => <RecordTable.InlineHead icon={IconChartBar} label="Amount" />,
  //   cell: ({ cell }) => {
  //     return (
  //       <RecordTableInlineCell>
  //         <TextOverflowTooltip value={cell.getValue() as string} />
  //       </RecordTableInlineCell>
  //     );
  //   },
  // },
];
