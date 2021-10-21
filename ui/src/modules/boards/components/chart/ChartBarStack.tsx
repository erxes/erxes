import { BarChart, Bar, LabelList } from 'recharts';

import React from 'react';
import { getColors } from 'modules/boards/utils';
import MainChart from './MainChart';
import { Item, Assignee } from 'modules/boards/types';

type Props = {
  items: Item[];
  assignees: Assignee[];
};

export default function ChartBarStack({ items, assignees }: Props) {
  const renderCustomizedLabel = props => {
    const { x, y, width, value } = props;
    const radius = 10;

    return (
      <g>
        <circle cx={x + width / 2} cy={y - radius} r={radius} fill="#8884d8" />
        <text
          x={x + width / 2}
          y={y - radius}
          fill="#fff"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {value}
        </text>
      </g>
    );
  };

  return (
    <MainChart component={BarChart} data={assignees}>
      {items.map((stage, index) => (
        <Bar
          key={index}
          dataKey={stage.name}
          stackId="a"
          fill={getColors(index)}
        >
          <LabelList dataKey={index} content={renderCustomizedLabel} />
        </Bar>
      ))}
    </MainChart>
  );
}
