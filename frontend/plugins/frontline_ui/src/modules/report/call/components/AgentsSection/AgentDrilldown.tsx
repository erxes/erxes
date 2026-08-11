import type { AgentStat } from '../../types';
import { fmtDur, fmtPct } from '../../utils';

interface AgentDrilldownProps {
  stat: AgentStat;
}

/** Inline expanded row shown when an agent row is clicked. */
export function AgentDrilldown({ stat }: AgentDrilldownProps) {
  const totalTalk = stat.averageTalkTime * stat.answeredCalls;

  const items = [
    { label: 'Shortest call', value: fmtDur(stat.shortestCall) },
    { label: 'Longest call', value: fmtDur(stat.longestCall) },
    { label: 'Total talk', value: fmtDur(totalTalk) },
    { label: 'Miss rate', value: fmtPct(stat.missedRate) },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4 bg-muted/30 px-5 py-4 sm:grid-cols-4">
      {items.map(({ label, value }) => (
        <div key={label} className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
          <p className="font-mono text-sm font-semibold tabular-nums">
            {value}
          </p>
        </div>
      ))}
    </div>
  );
}
