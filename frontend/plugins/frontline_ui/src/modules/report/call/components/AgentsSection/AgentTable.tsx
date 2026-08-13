import { Fragment, useState } from 'react';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { AgentStat } from '../../types';
import { fmtDur, fmtNum, fmtPct } from '../../utils';
import { Meter, rateColorVar } from '../Meter';
import { ReportTable } from '../ReportTable';
import { AgentAvatar } from './AgentAvatar';
import { AgentDrilldown } from './AgentDrilldown';

interface AgentTableProps {
  stats: AgentStat[];
}

export function AgentTable({ stats }: AgentTableProps) {
  const { t } = useTranslation('frontline');
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (agent: string) =>
    setExpanded((prev) => (prev === agent ? null : agent));

  if (!stats.length) {
    return <ReportTable.Empty>{t('no-agent-data')}</ReportTable.Empty>;
  }

  const busiest = Math.max(...stats.map(({ totalCalls }) => totalCalls), 1);

  return (
    <ReportTable>
      <ReportTable.Header>
        <ReportTable.HeaderRow>
          <ReportTable.Head className="w-12 px-2" />
          <ReportTable.Head>Agent</ReportTable.Head>
          <ReportTable.Head align="right" className="w-32">
            {t('total')}
          </ReportTable.Head>
          <ReportTable.Head align="right">{t('answered')}</ReportTable.Head>
          <ReportTable.Head align="right">{t('missed')}</ReportTable.Head>
          <ReportTable.Head align="right" className="w-32">
            Ans. Rate
          </ReportTable.Head>
          <ReportTable.Head align="right">Avg Wait</ReportTable.Head>
          <ReportTable.Head align="right">Avg Talk</ReportTable.Head>
        </ReportTable.HeaderRow>
      </ReportTable.Header>
      <ReportTable.Body>
        {stats.map((stat, i) => {
          const isOpen = expanded === stat.agent;
          const label = stat.agentName || stat.agent;

          return (
            <Fragment key={stat.agent}>
              <ReportTable.Row
                index={i}
                className="cursor-pointer"
                onClick={() => toggle(stat.agent)}
              >
                <ReportTable.Cell className="w-12 px-2 py-3">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggle(stat.agent);
                    }}
                    className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {isOpen ? (
                      <IconChevronDown className="h-4 w-4" />
                    ) : (
                      <IconChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </ReportTable.Cell>

                <ReportTable.Cell>
                  <div className="flex items-center gap-3">
                    <span className="w-4 shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <AgentAvatar name={label} />
                    <div className="min-w-0 leading-tight">
                      <p className="truncate text-sm font-medium">{label}</p>
                      {stat.agentName && (
                        <p className="text-xs text-muted-foreground">
                          {t('extension')} {stat.agent}
                        </p>
                      )}
                    </div>
                  </div>
                </ReportTable.Cell>

                <ReportTable.Cell align="right" numeric className="w-32">
                  <p className="text-sm font-semibold">
                    {fmtNum(stat.totalCalls)}
                  </p>
                  <Meter
                    className="mt-1.5"
                    value={(stat.totalCalls / busiest) * 100}
                    colorVar="var(--chart-2)"
                  />
                </ReportTable.Cell>

                <ReportTable.Cell align="right">
                  <ReportTable.Badge tone="success">
                    {fmtNum(stat.answeredCalls)}
                  </ReportTable.Badge>
                </ReportTable.Cell>

                <ReportTable.Cell align="right">
                  <ReportTable.Badge tone="destructive">
                    {fmtNum(stat.missedCalls)}
                  </ReportTable.Badge>
                </ReportTable.Cell>

                <ReportTable.Cell align="right" numeric className="w-32">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: rateColorVar(stat.answeredRate) }}
                  >
                    {fmtPct(stat.answeredRate)}
                  </p>
                  <Meter
                    className="mt-1.5"
                    value={stat.answeredRate}
                    colorVar={rateColorVar(stat.answeredRate)}
                  />
                </ReportTable.Cell>

                <ReportTable.Cell
                  align="right"
                  numeric
                  className="font-mono text-sm"
                >
                  {fmtDur(stat.averageWaitTime)}
                </ReportTable.Cell>

                <ReportTable.Cell
                  align="right"
                  numeric
                  className="font-mono text-sm"
                >
                  {fmtDur(stat.averageTalkTime)}
                </ReportTable.Cell>
              </ReportTable.Row>

              {isOpen && (
                <ReportTable.Row index={i}>
                  <ReportTable.Cell colSpan={8} className="p-0">
                    <AgentDrilldown stat={stat} />
                  </ReportTable.Cell>
                </ReportTable.Row>
              )}
            </Fragment>
          );
        })}
      </ReportTable.Body>
    </ReportTable>
  );
}
