import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  formatSlaMinutes,
  TSlaClockState,
  useTicketSlaStatus,
} from '@/ticket/hooks/useTicketSlaStatus';

type TProps = {
  sla?: Parameters<typeof useTicketSlaStatus>[0];
};

const VARIANTS: Record<
  TSlaClockState['state'],
  'success' | 'destructive' | 'warning' | 'secondary'
> = {
  met: 'success',
  missed: 'destructive',
  overdue: 'destructive',
  running: 'secondary',
};

export const TicketSlaStatus = ({ sla }: TProps) => {
  const { t } = useTranslation('frontline');
  const clocks = useTicketSlaStatus(sla || null);

  if (!clocks.length) {
    return null;
  }

  const describe = ({ state, minutes }: TSlaClockState) => {
    if (state === 'met') return t('sla-met', 'Met');
    if (state === 'missed') return t('sla-missed', 'Missed');
    if (state === 'overdue')
      return t('sla-overdue', '{{time}} overdue', { time: formatSlaMinutes(minutes) });
    return t('sla-left', '{{time}} left', { time: formatSlaMinutes(minutes) });
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {clocks.map((clock) => (
        <Badge
          key={clock.clock}
          variant={VARIANTS[clock.state]}
          title={clock.dueAt.toLocaleString()}
        >
          {clock.clock === 'firstResponse'
            ? t('sla-first-response', 'First response')
            : t('sla-resolution', 'Resolution')}
          {': '}
          {describe(clock)}
        </Badge>
      ))}
    </div>
  );
};
