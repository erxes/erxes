import { IconTag, IconRefresh, IconBox } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable, RecordTableInlineCell, Badge } from 'erxes-ui';
import { useState } from 'react';
import { IAgent } from '../types/agent';
import { agentMoreColumn } from './AgentMoreColumn';
import { AgentEditSheet } from './AgentEditSheet';

const NumberCell = ({ agent }: { agent: IAgent }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RecordTableInlineCell
        className="text-xs font-medium cursor-pointer hover:underline"
        onClick={() => setOpen(true)}
      >
        {agent.number || '—'}
      </RecordTableInlineCell>
      {open && (
        <AgentEditSheet agent={agent} open={open} onOpenChange={setOpen} />
      )}
    </>
  );
};

const ProductRulesCell = ({ agent }: { agent: IAgent }) => {
  const rules = agent.rulesOfProducts || [];

  if (rules.length === 0) {
    return <RecordTableInlineCell>—</RecordTableInlineCell>;
  }

  return (
    <RecordTableInlineCell>
      <span className="text-xs text-muted-foreground">
        {rules.length} rule{rules.length > 1 ? 's' : ''}
      </span>
    </RecordTableInlineCell>
  );
};

export const agentColumns: ColumnDef<IAgent>[] = [
  agentMoreColumn as ColumnDef<IAgent>,
  RecordTable.checkboxColumn as ColumnDef<IAgent>,
  {
    id: 'number',
    accessorKey: 'number',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Number" />,
    size: 150,
    cell: ({ row }) => <NumberCell agent={row.original} />,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Status" />,
    size: 100,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="default">{cell.getValue() as string}</Badge>
      </RecordTableInlineCell>
    ),
  },
  {
    id: 'hasReturn',
    accessorKey: 'hasReturn',
    header: () => (
      <RecordTable.InlineHead icon={IconRefresh} label="Has Return" />
    ),
    size: 100,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <span
          className={
            cell.getValue()
              ? 'text-green-600 font-medium'
              : 'text-muted-foreground'
          }
        >
          {cell.getValue() ? 'TRUE' : 'FALSE'}
        </span>
      </RecordTableInlineCell>
    ),
  },

  {
    id: 'productRules',
    accessorKey: 'rulesOfProducts',
    header: () => (
      <RecordTable.InlineHead icon={IconBox} label="Product Rules" />
    ),
    cell: ({ row }) => <ProductRulesCell agent={row.original} />,
  },
];
