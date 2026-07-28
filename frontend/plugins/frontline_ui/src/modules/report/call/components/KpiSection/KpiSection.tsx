import {
  IconClock,
  IconPercentage,
  IconPhone,
  IconPhoneCheck,
  IconPhoneOff,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { KpiCard } from './KpiCard';
import { useKpiScorecard } from '../../hooks/useKpiScorecard';
import { useCallFilters } from '../../hooks/useCallFilters';
import { fmtDur, fmtNum, fmtPct } from '../../utils';

/** 6-card KPI scorecard row. */
export function KpiSection() {
  const { t } = useTranslation('frontline');
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
      title: t('kpi-total-calls'),
      value: fmtNum(kpi?.callstotal),
      subtitle: dateRangeLabel,
      icon: <IconPhone className="h-5 w-5" />,
      valueClass: 'text-[var(--chart-1)]',
      iconClass: 'bg-[var(--chart-1)]/10 text-[var(--chart-1)]',
    },
    {
      title: t('kpi-service-level'),
      value: fmtPct(kpi?.serviceLevel),
      subtitle: t('kpi-service-level-subtitle'),
      icon: <IconShieldCheck className="h-5 w-5" />,
      valueClass: 'text-[var(--chart-2)]',
      iconClass: 'bg-[var(--chart-2)]/10 text-[var(--chart-2)]',
    },
    {
      title: t('kpi-abandonment-rate'),
      value: fmtPct(kpi?.abandonment),
      subtitle: t('kpi-abandonment-rate-subtitle'),
      icon: <IconPhoneOff className="h-5 w-5" />,
      valueClass: 'text-[var(--neg)]',
      iconClass: 'bg-[var(--neg)]/10 text-[var(--neg)]',
    },
    {
      title: t('kpi-avg-speed-of-answer'),
      value: fmtDur(kpi?.averageSpeed),
      subtitle: t('kpi-avg-speed-of-answer-subtitle'),
      icon: <IconClock className="h-5 w-5" />,
      valueClass: 'text-[var(--warn)]',
      iconClass: 'bg-[var(--warn)]/10 text-[var(--warn)]',
    },
    {
      title: t('kpi-avg-handle-time'),
      value: fmtDur(kpi?.averageAnsweredTime),
      subtitle: t('kpi-avg-handle-time-subtitle'),
      icon: <IconPhoneCheck className="h-5 w-5" />,
      valueClass: 'text-[var(--pos)]',
      iconClass: 'bg-[var(--pos)]/10 text-[var(--pos)]',
    },
    {
      title: t('kpi-answer-rate'),
      value: fmtPct(answerRate),
      subtitle: direction !== 'all' ? t('kpi-direction-only', { direction }) : t('kpi-all-directions'),
      icon: <IconPercentage className="h-5 w-5" />,
      valueClass: 'text-[var(--chart-3)]',
      iconClass: 'bg-[var(--chart-3)]/10 text-[var(--chart-3)]',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <KpiCard key={card.title} {...card} />
      ))}
    </div>
  );
}
