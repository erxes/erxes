import { Badge } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBroadcastDetailStatistics } from '../../../hooks/useBroadcastDetailStatistics';
import { TBroadcastMessage } from '../../../types';
import {
  statisticShare,
  TBroadcastStatisticConfig,
} from '../../../utils/broadcastStatistics';
import { BroadcastAudienceSummary } from '../BroadcastAudienceSummary';
import { BroadcastScheduleSummary } from '../BroadcastScheduleSummary';

export const BroadcastTabStatisticContent = ({
  message,
}: {
  message: TBroadcastMessage;
}) => {
  const { t, i18n } = useTranslation('broadcasts');
  const { stats, config, provider } = useBroadcastDetailStatistics(message);

  return (
    <div className="w-full px-8 py-5 space-y-5">
      <div className="space-x-8">
        <span className="text-muted-foreground inline-flex gap-2">
          {t('stat.has-run')}
          <strong className="text-primary">{message.runCount}</strong>
        </span>
        <span className="text-muted-foreground inline-flex gap-2">
          {t('stat.last-run')}
          <strong className="text-primary">
            {message.lastRunAt
              ? new Date(message.lastRunAt).toLocaleString(i18n.language, {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })
              : t('stat.never')}
          </strong>
        </span>
      </div>
      <BroadcastAudienceSummary message={message} />
      <BroadcastScheduleSummary message={message} />
      <BroadcastStatisticGrid
        stats={stats}
        config={config}
        provider={provider}
      />
    </div>
  );
};

const BroadcastStatisticGrid = ({
  stats,
  config,
  provider,
}: {
  stats: Record<string, number>;
  config: TBroadcastStatisticConfig;
  provider: string;
}) => {
  const { t } = useTranslation('broadcasts');

  // A figure the method does not report is left out rather than shown as 0.
  const shown = Object.entries(config).filter(
    ([key]) => !Object.keys(stats).length || key in stats,
  );

  return (
    <div className="grid grid-cols-3 gap-4">
      {shown.map(([key, { titleKey, descriptionKey, icon: Icon }]) => (
        <div key={key} className="flex flex-col border rounded-md p-5">
          <div className="mb-3">
            <div className="inline-flex items-center gap-2 text-primary">
              <Icon className="h-4 w-4" />
              <span className="font-medium">{t(titleKey)}</span>
            </div>
            <div className="mt-1 flex justify-between items-center">
              <span className="text-2xl text-primary font-semibold">
                {stats[key] || 0}
              </span>
              <Badge variant="secondary">
                {statisticShare(key, stats[key] || 0, stats.total || 0, t)}
              </Badge>
            </div>
          </div>
          <p className="mt-auto text-justify text-muted-foreground">
            {t(descriptionKey, { provider })}
          </p>
        </div>
      ))}
    </div>
  );
};
