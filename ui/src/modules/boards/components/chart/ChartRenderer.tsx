import { AreaChart, Area, BarChart, Bar, LineChart, Line } from 'recharts';

import React from 'react';
import { getColors } from 'modules/boards/utils';
import MainChart from './MainChart';
import { Item, Assignee } from 'modules/boards/types';

type Props = {
  items: Item[];
  assignees: Assignee[];
  chartType: string;
};

export default function ChartRenderer({ items, assignees, chartType }: Props) {
  switch (chartType) {
    case 'simpleBar': {
      return (
        <MainChart component={BarChart} data={assignees}>
          {items.map((item, index) => (
            <Bar
              key={index}
              dataKey={item.name}
              fill={item.color || getColors(index)}
            />
          ))}
        </MainChart>
      );
    }

    case 'area': {
      return (
        <MainChart component={AreaChart} data={assignees}>
          {items.map((item, index) => (
            <Area
              key={index}
              type="monotone"
              dataKey={item.name}
              stroke={item.color || getColors(index)}
              stackId="1"
              fill={item.color || getColors(index)}
            />
          ))}
        </MainChart>
      );
    }

    case 'line': {
      return (
        <MainChart component={LineChart} data={assignees}>
          {items.map((item, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={item.name}
              stroke={item.color || getColors(index)}
              activeDot={{ r: 8 }}
            />
          ))}
        </MainChart>
      );
    }

    default: {
      return (
        <MainChart component={BarChart} data={assignees}>
          {items.map((item, index) => (
            <Bar
              key={index}
              dataKey={item.name}
              stackId="a"
              fill={item.color || getColors(index)}
            />
          ))}
        </MainChart>
      );
    }
  }
}
