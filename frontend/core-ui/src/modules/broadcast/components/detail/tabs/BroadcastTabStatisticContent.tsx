import {
  IconBan,
  IconBounceRightFilled,
  IconClockPause,
  IconBrandTelegram,
  IconClick,
  IconMail,
  IconMailCheck,
  IconMailOpened,
  IconMoodSad,
  IconXboxXFilled,
} from '@tabler/icons-react';
import type { TablerIcon } from '@tabler/icons-react';
import { useQuery } from '@apollo/client';
import { Badge } from 'erxes-ui';
import {
  BROADCAST_NOTIFICATION_STATISTIC,
  BROADCAST_WORKFLOW_STATISTIC,
} from '../../../constants';
import { BROADCAST_RUNS } from '../../../graphql/queries';
import { BroadcastAudienceSummary } from '../BroadcastAudienceSummary';
import { BroadcastScheduleSummary } from '../BroadcastScheduleSummary';
import { useTranslation } from 'react-i18next';

type TBroadcastStatisticConfig = Record<
  string,
  { title: string; description: string; icon: TablerIcon }
>;

const EMAIL_DETAIL_STATISTIC: TBroadcastStatisticConfig = {
  total: {
    title: 'Total',
    description:
      'The cumulative count of all email messages processed during this broadcast.',
    icon: IconMail,
  },
  send: {
    title: 'Sent',
    description:
      'The handoff to Amazon SES was successful and delivery is now being attempted.',
    icon: IconBrandTelegram,
  },
  delivery: {
    title: 'Delivered',
    description:
      'The email was successfully accepted by the recipient’s incoming mail server.',
    icon: IconMailCheck,
  },
  open: {
    title: 'Opened',
    description:
      'The recipient viewed the message content within their specific email client.',
    icon: IconMailOpened,
  },
  click: {
    title: 'Clicked',
    description:
      'The recipient interacted with one or more tracked hyperlinks in the email.',
    icon: IconClick,
  },
  complaint: {
    title: 'Complaint/Spam',
    description:
      'The recipient received the email but manually flagged the message as spam.',
    icon: IconMoodSad,
  },
  bounce: {
    title: 'Bounce',
    description:
      'The recipient’s mail server permanently rejected the message delivery attempt.',
    icon: IconBounceRightFilled,
  },
  renderingfailure: {
    title: 'Rendering failure',
    description:
      'The email was not sent due to a technical error within the template syntax.',
    icon: IconXboxXFilled,
  },
  reject: {
    title: 'Rejected',
    description:
      'The email was scanned by Amazon SES, found to be a risk, and blocked.',
    icon: IconBan,
  },
  deferred: {
    title: 'Deferred',
    description:
      'The receiving server asked for the message later. Nothing has failed — but a number climbing here is the provider holding this campaign back.',
    icon: IconClockPause,
  },
};

const buildWorkflowStats = (message: any) => {
  const { totalCustomersCount = 0, validCustomersCount = 0 } = message || {};

  return { total: totalCustomersCount, started: validCustomersCount };
};

const buildNotificationStats = (message: any) => {
  const {
    totalCustomersCount = 0,
    validCustomersCount = 0,
    stats,
    notification,
  } = message || {};

  return {
    total: totalCustomersCount,
    sent: validCustomersCount,
    read: stats?.read || 0,
    push: notification?.isMobile ? 1 : 0,
  };
};

const STATISTIC_BUILDERS: Record<
  string,
  {
    config: TBroadcastStatisticConfig;
    build: (message: any) => Record<string, number>;
  }
> = {
  notification: {
    config: BROADCAST_NOTIFICATION_STATISTIC,
    build: buildNotificationStats,
  },
  workflow: {
    config: BROADCAST_WORKFLOW_STATISTIC,
    build: buildWorkflowStats,
  },
};

/**
 * What the run decided against. Every method writes a manifest now, so the
 * difference between "targeted" and "sent" has an answer — without this box a
 * campaign that reached two thirds of its audience looks the same as one that
 * reached all of it.
 */
const SKIPPED_STATISTIC: TBroadcastStatisticConfig = {
  skipped: {
    title: 'Not sent',
    description:
      'Recipients the run decided against — unsubscribed, no address, already reached by an earlier run, or gone.',
    icon: IconBan,
  },
};

export const BroadcastTabStatisticContent = ({ message }: { message: any }) => {
  const { t } = useTranslation('broadcasts');
  const { stats, runCount, lastRunAt, method } = message || {};
  const builder = STATISTIC_BUILDERS[method];

  const { data } = useQuery(BROADCAST_RUNS, {
    variables: { engageMessageId: message?._id },
    skip: !message?._id,
  });

  // Runs come back newest first, and the figures above describe the last one.
  const counts = data?.engageBroadcastRuns?.[0]?.counts || {};
  const skipped =
    (counts.skipped || 0) + (counts.failed || 0) + (counts.missing || 0);

  // A method with no stats document of its own reports none, so anything but
  // an object is read as empty rather than indexed into.
  const methodStats = builder
    ? builder.build(message)
    : stats && typeof stats === 'object'
    ? stats
    : {};

  const displayStats = skipped ? { ...methodStats, skipped } : methodStats;

  const statisticConfig = {
    ...(builder?.config || EMAIL_DETAIL_STATISTIC),
    ...(skipped ? SKIPPED_STATISTIC : {}),
  };

  return (
    <div className="w-full px-8 py-5 space-y-5">
      <div className="space-x-8">
        <span className="text-muted-foreground inline-flex gap-2">
          {t('stat.has-run')}
          <strong className="text-primary">{runCount}</strong>
        </span>
        <span className="text-muted-foreground inline-flex gap-2">
          {t('stat.last-run')}
          <strong className="text-primary">
            {lastRunAt
              ? new Date(lastRunAt).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : t('stat.never')}
          </strong>
        </span>
      </div>
      <BroadcastAudienceSummary message={message} />
      <BroadcastScheduleSummary message={message} />
      <BroadcastTabStatistics
        stats={displayStats}
        statisticConfig={statisticConfig}
      />
    </div>
  );
};

export const BroadcastTabStatistics = ({
  stats,
  statisticConfig = EMAIL_DETAIL_STATISTIC,
}: {
  stats: Record<string, number>;
  statisticConfig?: TBroadcastStatisticConfig;
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(statisticConfig).map(
        ([key, { title, description, icon: Icon }]) => {
          if (Object.keys(stats || {})?.length && !(key in (stats || {}))) {
            return null;
          }

          const total = stats?.total || 0;
          const value = stats?.[key] || 0;
          const percentage =
            key === 'push'
              ? value > 0
                ? 100
                : 0
              : total > 0
              ? Math.min((value * 100) / total, 100)
              : 0;

          return (
            <div key={key} className="flex flex-col border rounded-md p-5">
              <div className="mb-3">
                <div className="inline-flex items-center gap-2 text-primary">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{title}</span>
                </div>
                <div className="mt-1 flex justify-between items-center">
                  <span className="text-2xl text-primary font-semibold">
                    {value}
                  </span>

                  <Badge variant="secondary">
                    {key === 'push'
                      ? value > 0
                        ? 'Yes'
                        : 'No'
                      : total
                      ? ((v) => (Number.isInteger(v) ? v : v.toFixed(2)))(
                          percentage,
                        )
                      : '-'}
                    {key !== 'push' && total ? '%' : ''}
                  </Badge>
                </div>
              </div>
              <p className="mt-auto text-justify text-muted-foreground">
                {description}
              </p>
            </div>
          );
        },
      )}
    </div>
  );
};
