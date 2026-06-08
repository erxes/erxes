import {
  IconClock,
  IconPercentage,
  IconPhone,
  IconPhoneCheck,
  IconPhoneOff,
  IconShieldCheck,
} from '@tabler/icons-react';
import { KpiCard } from './KpiCard';
import { useKpiScorecard } from '../../hooks/useKpiScorecard';
import { useCallFilters } from '../../hooks/useCallFilters';
import { fmt, fmtDur, fmtNum, fmtPct } from '../../utils';

/** 6-card KPI scorecard row. */
export function KpiSection() {
  const { kpi, loading } = useKpiScorecard();
  const { direction, dateRangeLabel } = useCallFilters();

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl border bg-muted/30 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const answerRate =
    kpi?.serviceLevel != null ? 100 - (kpi.abandonment ?? 0) : null;

  const cards = [
    {
      title: 'Total Calls',
      value: fmtNum(kpi?.callstotal),
      subtitle: dateRangeLabel,
      icon: <IconPhone className="h-5 w-5" />,
      valueClass: 'text-[var(--chart-1)]',
      iconClass: 'bg-[var(--chart-1)]/10 text-[var(--chart-1)]',
    },
    {
      title: 'Service Level',
      value: fmtPct(kpi?.serviceLevel),
      subtitle: '≤ 20 s answer target',
      icon: <IconShieldCheck className="h-5 w-5" />,
      valueClass: 'text-[var(--chart-2)]',
      iconClass: 'bg-[var(--chart-2)]/10 text-[var(--chart-2)]',
    },
    {
      title: 'Abandonment Rate',
      value: fmtPct(kpi?.abandonment),
      subtitle: 'Inbound abandoned',
      icon: <IconPhoneOff className="h-5 w-5" />,
      valueClass: 'text-[var(--neg)]',
      iconClass: 'bg-[var(--neg)]/10 text-[var(--neg)]',
    },
    {
      title: 'Avg Speed of Answer',
      value: fmtDur(kpi?.averageSpeed),
      subtitle: 'Time before answer',
      icon: <IconClock className="h-5 w-5" />,
      valueClass: 'text-[var(--warn)]',
      iconClass: 'bg-[var(--warn)]/10 text-[var(--warn)]',
    },
    {
      title: 'Avg Handle Time',
      value: fmtDur(kpi?.averageAnsweredTime),
      subtitle: 'Talk + estimated wrap',
      icon: <IconPhoneCheck className="h-5 w-5" />,
      valueClass: 'text-[var(--pos)]',
      iconClass: 'bg-[var(--pos)]/10 text-[var(--pos)]',
    },
    {
      title: 'Answer Rate',
      value: fmtPct(answerRate),
      subtitle: direction !== 'all' ? `${direction} only` : 'All directions',
      icon: <IconPercentage className="h-5 w-5" />,
      valueClass: 'text-[var(--chart-3)]',
      iconClass: 'bg-[var(--chart-3)]/10 text-[var(--chart-3)]',
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}
    </div>
  );
}
