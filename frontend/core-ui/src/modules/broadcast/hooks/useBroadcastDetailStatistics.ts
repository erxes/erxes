import { TBroadcastMessage } from '../types';
import {
  EMAIL_STATISTIC,
  SKIPPED_STATISTIC,
  STATISTIC_BUILDERS,
} from '../utils/broadcastStatistics';
import { useBroadcastEmailProvider } from './useBroadcastEmailProvider';
import { useBroadcastRuns } from './useBroadcastRuns';

/** The figures a campaign's statistic tab shows, and what each one means. */
export const useBroadcastDetailStatistics = (message: TBroadcastMessage) => {
  const { providerName } = useBroadcastEmailProvider();
  const { runs } = useBroadcastRuns(message._id);
  const builder = message.method ? STATISTIC_BUILDERS[message.method] : null;

  // Runs come back newest first, and the figures describe the last one.
  const counts = runs[0]?.counts || {};
  const skipped =
    (counts.skipped || 0) + (counts.failed || 0) + (counts.missing || 0);

  // A method with no stats document of its own reports none, so anything but
  // an object is read as empty rather than indexed into.
  const methodStats = builder
    ? builder.build(message)
    : message.stats && typeof message.stats === 'object'
    ? message.stats
    : {};

  return {
    provider: providerName,
    stats: skipped ? { ...methodStats, skipped } : methodStats,
    config: {
      ...(builder?.config || EMAIL_STATISTIC),
      ...(skipped ? SKIPPED_STATISTIC : {}),
    },
  };
};
