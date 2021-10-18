import { PieChart, Pie } from 'recharts';

import React from 'react';
import { getColors } from 'modules/boards/utils';
import MainChart from './MainChart';

type Props = {
  bars: any[];
  usersWithInfo: any[];
};

export default function ChartPie({ bars, usersWithInfo }: Props) {
  return (
    <MainChart component={PieChart} data={usersWithInfo}>
      {bars.map((item, index) => (
        <Pie
          key={index}
          dataKey={item.name}
          isAnimationActive={false}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill={getColors(index)}
          label
        />
      ))}
    </MainChart>
  );
}
