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
import { SideMenu } from 'erxes-ui';
import { useBroadcastStatistic } from '../hooks/useBroadcastStatistic';

const STATISTIC_KINDS = {
  avgSendPercent: {
    label: 'Sent',
    icon: IconBrandTelegram,
  },
  avgDeliveryPercent: {
    label: 'Delivered',
    icon: IconMessageCircleCheck,
  },
  avgOpenPercent: {
    label: 'Opened',
    icon: IconMailOpened,
  },
  avgClickPercent: {
    label: 'Clicked',
    icon: IconClick,
  },
  avgComplaintPercent: {
    label: 'Complaints',
    icon: IconMoodSad,
  },
  avgBouncePercent: {
    label: 'Bounce',
    icon: IconBounceRightFilled,
  },
  avgRejectPercent: {
    label: 'Rejected',
    icon: IconBan,
  },
  avgRenderingFailurePercent: {
    label: 'Rendering Failure',
    icon: IconXboxXFilled,
  },
};

export const BroadcastStatistic = () => {
  const { statistics } = useBroadcastStatistic();

  return (
    <SideMenu>
      <SideMenu.Content value="statistic">
        <SideMenu.Header
          Icon={IconChartCandle}
          label="Average email statistics"
        />
        <div className="h-full bg-white p-4 space-y-3 overflow-y-auto">
          {Object.entries(STATISTIC_KINDS).map(
            ([key, { label, icon: Icon }]) => {
              const value =
                Number(statistics[key as keyof typeof statistics]) ?? 0;

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
                      {label}
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
          label="Statistic"
          Icon={IconChartCandle}
        />
      </SideMenu.Sidebar>
    </SideMenu>
  );
};
