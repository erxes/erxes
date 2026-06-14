import { useState } from 'react';
import { Table, cn } from 'erxes-ui';
import { IconChevronDown, IconChevronRight } from '@tabler/icons-react';
import type { AgentStat } from '../../types';
import { fmtDur, fmtNum, fmtPct } from '../../utils';
import { AgentAvatar } from './AgentAvatar';
import { AgentDrilldown } from './AgentDrilldown';

interface AgentTableProps {
  stats: AgentStat[];
}

/** Leaderboard table for agents with expandable drilldown rows. */
export function AgentTable({ stats }: AgentTableProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggle = (agent: string) =>
    setExpanded((prev) => (prev === agent ? null : agent));

  if (!stats.length) {
    return (
      <div className="rounded-xl border-2 border-dashed p-10 text-center text-sm text-muted-foreground">
        No agent data for the selected range
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <Table>
        <Table.Header>
          <Table.Row className="bg-muted/50">
            <Table.Head className="font-semibold w-8" />
            <Table.Head className="font-semibold">Agent</Table.Head>
            <Table.Head className="font-semibold text-right">Total</Table.Head>
            <Table.Head className="font-semibold text-right">
              Answered
            </Table.Head>
            <Table.Head className="font-semibold text-right">Missed</Table.Head>
            <Table.Head className="font-semibold text-right">
              Ans. Rate
            </Table.Head>
            <Table.Head className="font-semibold text-right">
              Avg Wait
            </Table.Head>
            <Table.Head className="font-semibold text-right">
              Avg Talk
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {stats.map((stat, i) => {
            const isOpen = expanded === stat.agent;
            return (
              <>
                <Table.Row
                  key={stat.agent}
                  className={cn(
                    'cursor-pointer hover:bg-muted/30',
                    i % 2 !== 0 && 'bg-muted/10',
                  )}
                  onClick={() => toggle(stat.agent)}
                >
                  <Table.Cell className="px-2">
                    {isOpen ? (
                      <IconChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <IconChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center gap-2">
                      <AgentAvatar name={stat.agentName || stat.agent} />
                      <span className="font-medium text-sm">
                        {stat.agentName || stat.agent}
                      </span>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-right font-semibold">
                    {fmtNum(stat.totalCalls)}
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <span className="inline-flex items-center rounded-md bg-(--pos)/10 px-2 py-0.5 text-xs font-medium text-(--pos)">
                      {fmtNum(stat.answeredCalls)}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    <span className="inline-flex items-center rounded-md bg-(--neg)/10 px-2 py-0.5 text-xs font-medium text-(--neg)">
                      {fmtNum(stat.missedCalls)}
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-right font-medium">
                    {fmtPct(stat.answeredRate)}
                  </Table.Cell>
                  <Table.Cell className="text-right font-mono text-sm">
                    {fmtDur(stat.averageWaitTime)}
                  </Table.Cell>
                  <Table.Cell className="text-right font-mono text-sm">
                    {fmtDur(stat.averageTalkTime)}
                  </Table.Cell>
                </Table.Row>

                {isOpen && (
                  <Table.Row key={`${stat.agent}-drill`}>
                    <Table.Cell colSpan={8} className="p-0">
                      <AgentDrilldown stat={stat} />
                    </Table.Cell>
                  </Table.Row>
                )}
              </>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
}
