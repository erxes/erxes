import { RecordTableInlineCell, Table } from 'erxes-ui';

export const DetailAmountCell = ({ value }: { value?: number | null }) => (
  <Table.Cell>
    <RecordTableInlineCell>
      {(value ?? 0).toLocaleString()}
    </RecordTableInlineCell>
  </Table.Cell>
);
