import { AreaChart, Area } from 'recharts';

import React from 'react';
import { getColors } from 'modules/boards/utils';
import MainChart from './MainChart';
import { Item, Assignee } from 'modules/boards/types';

type Props = {
  items: Item[];
  assignees: Assignee[];
};

export default function ChartArea({ items, assignees }: Props) {
  return (
    <MainChart component={AreaChart} data={assignees}>
      {items.map((item, index) => (
        <Area
          key={index}
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
