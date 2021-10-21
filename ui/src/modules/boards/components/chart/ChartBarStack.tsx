import { BarChart, Bar } from 'recharts';

import React from 'react';
import { getColors } from 'modules/boards/utils';
import MainChart from './MainChart';
import { Item, Assignee } from 'modules/boards/types';

type Props = {
  items: Item[];
  assignees: Assignee[];
};

export default function ChartBarStack({ items, assignees }: Props) {
  return (
    <MainChart component={BarChart} data={assignees}>
      {items.map((stage, index) => (
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
