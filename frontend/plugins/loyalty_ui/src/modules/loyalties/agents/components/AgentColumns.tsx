import { IconTag, IconRefresh, IconBox } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { RecordTable, RecordTableInlineCell, Badge } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

  const { t } = useTranslation('loyalty');

  if (rules.length === 0) {
    return <RecordTableInlineCell>—</RecordTableInlineCell>;
  }

  return (
    <RecordTableInlineCell>
      <span className="text-xs text-muted-foreground">
        {t('rules-count', { count: rules.length })}
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
    header: () => { const { t } = useTranslation('loyalty'); return <RecordTable.InlineHead icon={IconTag} label={t('number')} />; },
    size: 150,
    cell: ({ row }) => <NumberCell agent={row.original} />,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => { const { t } = useTranslation('loyalty'); return <RecordTable.InlineHead icon={IconTag} label={t('status')} />; },
    size: 100,
    cell: ({ cell }) => {
      const { t } = useTranslation('loyalty');
      return (
        <RecordTableInlineCell>
          <Badge variant="default">{t(cell.getValue() as string)}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'hasReturn',
    accessorKey: 'hasReturn',
    header: () => { const { t } = useTranslation('loyalty'); return <RecordTable.InlineHead icon={IconRefresh} label={t('has-return')} />; },
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
    header: () => { const { t } = useTranslation('loyalty'); return <RecordTable.InlineHead icon={IconBox} label={t('product-rules')} />; },
    cell: ({ row }) => <ProductRulesCell agent={row.original} />,
  },
];
