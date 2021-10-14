import { LineChart, Line } from 'recharts';

import React from 'react';
import { getColors } from 'modules/boards/utils';
import MainChart from './MainChart';

type Props = {
  bars: any[];
  usersWithInfo: any[];
};

export default function ChartLine({ bars, usersWithInfo }: Props) {
  return (
    <div style={{ width: '100%' }}>
      {bars.map((item, index) => (
        <MainChart key={index} component={LineChart} data={usersWithInfo}>
          <Line
            type="monotone"
            dataKey={item.name}
            stroke={getColors(index)}
            activeDot={{ r: 8 }}
          />
        </MainChart>
      ))}
    </div>
  );
}
