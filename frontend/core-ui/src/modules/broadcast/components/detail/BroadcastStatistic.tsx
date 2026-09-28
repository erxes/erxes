import {
  IconBan,
  IconBounceRightFilled,
  IconBrandTelegram,
  IconChartCandle,
  IconClick,
  IconMailOpened,
  IconMessageCircleCheck,
  IconMoodSad,
  IconXboxXFilled,
} from '@tabler/icons-react';
import { SideMenu, useMultiQueryState } from 'erxes-ui';
import { useBroadcastStatistic } from '../../hooks/useBroadcastStatistic';
import { IBroadcastMethodEnum } from '../../types';
import { useTranslation } from 'react-i18next';

const STATISTIC_KINDS = {
  avgSendPercent: {
    labelKey: 'stat.sent',
    icon: IconBrandTelegram,
  },
  avgDeliveryPercent: {
    labelKey: 'stat.delivered',
    icon: IconMessageCircleCheck,
  },
  avgOpenPercent: {
    labelKey: 'stat.opened',
    icon: IconMailOpened,
  },
  avgClickPercent: {
    labelKey: 'stat.clicked',
    icon: IconClick,
  },
  avgComplaintPercent: {
    labelKey: 'stat.complaints',
    icon: IconMoodSad,
  },
  avgBouncePercent: {
    labelKey: 'stat.bounce',
    icon: IconBounceRightFilled,
  },
  avgRejectPercent: {
    labelKey: 'stat.rejected',
    icon: IconBan,
  },
  avgRenderingFailurePercent: {
    labelKey: 'stat.rendering-failure',
    icon: IconXboxXFilled,
  },
};

/**
 * Every figure here — delivered, opened, bounced — is an email one, so it is
 * shown once the list is narrowed to email and not beside a workflow campaign
 * it says nothing about.
 */
export const BroadcastStatistic = () => {
  const { t } = useTranslation('broadcasts');
  const [{ methods }] = useMultiQueryState<{ methods: string }>(['methods']);
  const { statistics } = useBroadcastStatistic();

  if (methods !== IBroadcastMethodEnum.EMAIL) {
    return null;
  }

  return (
    <SideMenu>
      <SideMenu.Content value="statistic">
        <SideMenu.Header
          Icon={IconChartCandle}
          label={t('stat.average')}
        />
        <div className="h-full bg-white p-4 space-y-3 overflow-y-auto">
          {Object.entries(STATISTIC_KINDS).map(
            ([key, { labelKey, icon: Icon }]) => {
              const value =
                Number(statistics[key as keyof typeof statistics]) || 0;

              return (
                <div
                  key={key}
                  className="rounded-lg border p-4 flex items-center gap-4"
                >
                  <div className="p-2 rounded-md bg-muted">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex-1 flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">
                      {t(labelKey)}
                    </span>
                    <span className="text-lg font-semibold">
                      {Number.isInteger(value) ? value : value.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            },
          )}
        </div>
      </SideMenu.Content>
      <SideMenu.Sidebar>
        <SideMenu.Trigger
          value="statistic"
          label={t('tab.statistic')}
          Icon={IconChartCandle}
        />
      </SideMenu.Sidebar>
    </SideMenu>
  );
};
