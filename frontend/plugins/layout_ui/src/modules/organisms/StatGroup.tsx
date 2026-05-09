import * as React from 'react';
import { cn } from 'erxes-ui';
import { StatCard, StatCardProps } from '../molecules/StatCard';

export type StatGroupProps = {
  stats: StatCardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
};

const colsMap: Record<NonNullable<StatGroupProps['columns']>, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
};

export const StatGroup: React.FC<StatGroupProps> = ({
  stats,
  columns = 3,
  className,
}) => (
  <div
    className={cn(
      'grid grid-cols-1 gap-3 h-full',
      colsMap[columns],
      className,
    )}
  >
    {stats.map((stat, idx) => (
      <StatCard key={`${stat.label}-${idx}`} {...stat} />
    ))}
  </div>
);
