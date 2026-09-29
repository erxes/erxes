import { Fragment } from 'react';
import { CountUp } from '@/modules/ui/components/CountUp';
import { Icon, type IconName } from '@/modules/ui/components/Icon';

export type HeroStat = {
  icon: IconName;
  value: number;
  label: string;
};

export const HeroStats = ({ stats }: { stats: HeroStat[] }) => {
  if (!stats.length) {
    return null;
  }

  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[13px] text-white/45">
      {stats.map((stat, index) => (
        <Fragment key={stat.label}>
          {index ? (
            <span aria-hidden="true" className="text-white/20">
              ·
            </span>
          ) : null}
          <span className="inline-flex items-center gap-2">
            <Icon
              name={stat.icon}
              size={14}
              className="shrink-0 text-white/30"
            />
            <span className="font-semibold tabular-nums text-white/80">
              <CountUp value={stat.value} />
            </span>
            {stat.label}
          </span>
        </Fragment>
      ))}
    </p>
  );
};
