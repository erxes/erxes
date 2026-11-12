import type { LeadRecordType } from '@erxes/core-contract';
import { IconBuilding, IconChartFunnel, IconLayoutKanban, IconTable, IconUser } from '@tabler/icons-react';
import { Button, cn, useQueryState } from 'erxes-ui';
import { Link } from 'react-router-dom';

/** People and companies are both leads; `?kind=companies` shows the companies. */
export const useLeadKind = (): LeadRecordType => {
  const [kind] = useQueryState<string>('kind');

  return kind === 'companies' ? 'company' : 'customer';
};

const Segmented = ({ options }: { options: { active: boolean; onClick: () => void; icon: typeof IconTable; label: string }[] }) => (
  <div className="flex rounded-md bg-muted p-0.5">
    {options.map(({ active, onClick, icon: Icon, label }) => (
      <button
        key={label}
        type="button"
        onClick={onClick}
        className={cn('flex h-7 items-center gap-1.5 rounded px-2 text-sm text-muted-foreground', active && 'bg-background font-medium text-foreground shadow-xs')}
      >
        <Icon className="size-4" />
        {label}
      </button>
    ))}
  </div>
);

/** Leads header: people or companies, table or board, and the funnel report. */
export const LeadViewSwitch = () => {
  const [view, setView] = useQueryState<string>('view');
  const [, setKind] = useQueryState<string>('kind');
  const [, setStage] = useQueryState<string>('stage');
  const kind = useLeadKind();
  const board = view === 'board';

  return (
    <>
      <Button variant="ghost" asChild>
        <Link to={`/reports/leads${kind === 'company' ? '?kind=companies' : ''}`}>
          <IconChartFunnel />
          Insights
        </Link>
      </Button>
      <Segmented
        options={[
          { active: kind === 'customer', onClick: () => (setStage(null), setKind(null)), icon: IconUser, label: 'People' },
          { active: kind === 'company', onClick: () => (setStage(null), setKind('companies')), icon: IconBuilding, label: 'Companies' },
        ]}
      />
      <Segmented
        options={[
          { active: !board, onClick: () => setView(null), icon: IconTable, label: 'Table' },
          { active: board, onClick: () => setView('board'), icon: IconLayoutKanban, label: 'Board' },
        ]}
      />
    </>
  );
};
