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
    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs px-4 py-2.5 bg-muted/30">
      {items.map(({ label, value }) => (
        <div key={label}>
          <span className="text-muted-foreground">{label}</span>
          <span className="ml-1.5 font-mono font-semibold">{value}</span>
        </div>
      ))}
    </div>
  );
}
