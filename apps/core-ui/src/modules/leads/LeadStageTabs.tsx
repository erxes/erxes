import { cn, useQueryState } from 'erxes-ui';
import { useLeadStages } from './useLeads';

/** Above the leads list: All, then each stage with how many leads it holds. */
export const LeadStageTabs = () => {
  const { stages } = useLeadStages();
  const [stage, setStage] = useQueryState<string>('stage');
  const total = stages.reduce((sum, item) => sum + item.leadCount, 0);
  const tab = (id: string | null, label: React.ReactNode, count: number, color?: string) => (
    <button
      key={id ?? 'all'}
      type="button"
      onClick={() => setStage(id)}
      className={cn(
        'relative flex h-9 shrink-0 items-center gap-1.5 px-3 text-sm text-muted-foreground transition-colors hover:text-foreground',
        (stage ?? null) === id && 'font-medium text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-primary',
      )}
    >
      {color && <span className="size-2 rounded-full" style={{ background: color }} />}
      {label}
      <span className="rounded bg-muted px-1.5 text-xs tabular-nums">{count.toLocaleString('en')}</span>
    </button>
  );

  return (
    <div className="flex overflow-x-auto border-b px-2">
      {tab(null, 'All', total)}
      {stages.map((item) => tab(item.id, item.name, item.leadCount, item.color))}
    </div>
  );
};
