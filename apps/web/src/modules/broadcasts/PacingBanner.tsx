import type { Broadcast } from '@erxes/core-contract';
import { orpc } from '@erxes/core-contract/client';
import { IconClockPause } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { cn, useFormat } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/** Whether the organisation's emails wait now, asked while an email broadcast is sending. */
const usePacing = (broadcast: Broadcast) =>
  useQuery(
    orpc.emails.pacing.queryOptions({
      enabled: broadcast.channel === 'email' && broadcast.status === 'sending',
      refetchInterval: 30_000,
    }),
  ).data;

/**
 * A sending email broadcast whose copies wait: today's limit is used (they go
 * on when the next day's allowance opens) or sending is halted (an admin
 * must resume it in Settings).
 */
export const PacingBanner = ({ broadcast }: { broadcast: Broadcast }) => {
  const { t } = useTranslation('broadcasts');
  const fmt = useFormat();
  const pacing = usePacing(broadcast);
  const waiting = broadcast.stats.queued + broadcast.stats.sending;

  if (!pacing || (!pacing.halted && !pacing.limitReached) || !waiting) return null;

  return (
    <p
      className={cn(
        'flex items-start gap-2 rounded-lg border p-3 text-sm',
        pacing.halted
          ? 'border-destructive/30 bg-destructive/10 text-destructive-text'
          : 'border-warning/30 bg-warning/10',
      )}
    >
      <IconClockPause className="mt-0.5 size-4 shrink-0" aria-hidden />
      {pacing.halted
        ? t(
            'pacing-halted',
            'Sending halted by the bounce rate: {{count}} copies wait. An admin must resume it in Settings › Integrations › Email sending.',
            { count: waiting },
          )
        : t('pacing-limit', 'Sending is paced: {{count}} held until {{when}}', {
            count: waiting,
            when: pacing.until ? fmt.dateTime(pacing.until) : '',
          })}
    </p>
  );
};
