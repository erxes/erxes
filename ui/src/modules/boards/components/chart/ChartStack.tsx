import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import React from 'react';
import { IStage } from 'modules/boards/types';
import { getColors } from 'modules/boards/utils';
import EmptyState from 'modules/common/components/EmptyState';

type Props = {
  stages: IStage[];
  usersWithInfo: any[];
};

export default function ChartStack({ stages, usersWithInfo }: Props) {
  if (!stages) {
    return <EmptyState text="this data is empty" icon="piechart" />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={usersWithInfo}
        margin={{ top: 50, left: 50, bottom: 50, right: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {stages.map((stage, index) => (
          <Bar
            key={index}
            dataKey={stage.name}
            stackId="a"
            fill={getColors(index)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
