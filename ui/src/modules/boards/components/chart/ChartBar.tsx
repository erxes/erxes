import { BarChart, Bar } from 'recharts';

import React from 'react';
import { getColors } from 'modules/boards/utils';
import MainChart from './MainChart';

type Props = {
  bars: any[];
  usersWithInfo: any[];
};

export default function ChartBar({ bars, usersWithInfo }: Props) {
  return (
    <MainChart component={BarChart} data={usersWithInfo}>
      {bars.map((stage, index) => (
        <Bar
          key={index}
          dataKey={stage.name}
          stackId="a"
          fill={getColors(index)}
        />
      ))}
    </MainChart>
  );
}
