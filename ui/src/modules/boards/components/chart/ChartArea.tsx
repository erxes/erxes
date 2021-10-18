import { AreaChart, Area } from 'recharts';

import React from 'react';
import { getColors } from 'modules/boards/utils';
import MainChart from './MainChart';

type Props = {
  bars: any[];
  usersWithInfo: any[];
};

export default function ChartArea({ bars, usersWithInfo }: Props) {
  return (
    <MainChart component={AreaChart} data={usersWithInfo}>
      {bars.map((item, index) => (
        <Area
          type="monotone"
          dataKey={item.name}
          stroke={getColors(index)}
          stackId="1"
          fill={getColors(index)}
        />
      ))}
    </MainChart>
  );
}
