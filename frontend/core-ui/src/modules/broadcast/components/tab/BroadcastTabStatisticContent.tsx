import {
  IconBan,
  IconBounceRightFilled,
  IconBrandTelegram,
  IconClick,
  IconMail,
  IconMailCheck,
  IconMailOpened,
  IconMoodSad,
  IconXboxXFilled,
} from '@tabler/icons-react';
import { Badge } from 'erxes-ui';

const BROADCAST_DETAIL_STATISTIC = {
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
};

export const BroadcastTabStatisticContent = ({ message }: { message: any }) => {
  const { stats, runCount, lastRunAt } = message || {};

  return (
    <div className="w-full px-8 py-5 space-y-5">
      <div className="space-x-8">
        <span className="text-muted-foreground inline-flex gap-2">
          This campaign has run:
          <strong className="text-primary">{runCount}</strong>
        </span>
        <span className="text-muted-foreground inline-flex gap-2">
          Last run at:
          <strong className="text-primary">
            {lastRunAt
              ? new Date(lastRunAt).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : 'Never'}
          </strong>
        </span>
      </div>
      <BroadcastTabStatistics stats={stats} />
    </div>
  );
};

export const BroadcastTabStatistics = ({
  stats,
}: {
  stats: Record<string, number>;
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Object.entries(BROADCAST_DETAIL_STATISTIC).map(
        ([key, { title, description, icon: Icon }]) => {
          if (Object.keys(stats || {})?.length && !(key in (stats || {}))) {
            return null;
          }

          return (
            <div key={key} className="flex flex-col border rounded-md p-5">
              <div className="mb-3">
                <div className="inline-flex items-center gap-2 text-primary">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{title}</span>
                </div>
                <div className="mt-1 flex justify-between items-center">
                  <span className="text-2xl text-primary font-semibold">
                    {stats?.[key] || 0}
                  </span>

                  <Badge variant="secondary">
                    {stats?.total
                      ? ((v) => (Number.isInteger(v) ? v : v.toFixed(2)))(
                          Math.min((stats[key] * 100) / stats.total, 100),
                        )
                      : '-'}
                    %
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
