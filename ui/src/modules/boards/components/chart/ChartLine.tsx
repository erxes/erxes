import { LineChart, Line } from 'recharts';

import React from 'react';
import { getColors } from 'modules/boards/utils';
import MainChart from './MainChart';
import { Item, Assignee } from 'modules/boards/types';

type Props = {
  items: Item[];
  assignees: Assignee[];
};

export default function ChartLine({ items, assignees }: Props) {
  return (
    <MainChart component={LineChart} data={assignees}>
      {items.map((item, index) => (
        <Line
          type="monotone"
          dataKey={item.name}
          stroke={getColors(index)}
          activeDot={{ r: 8 }}
        />
      ))}
    </MainChart>
  );
}
