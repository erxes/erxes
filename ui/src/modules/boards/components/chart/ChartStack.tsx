import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

import React from 'react';
import { IStage } from 'modules/boards/types';
import { getColors } from 'modules/boards/utils';

type Props = {
  stages: IStage[];
  usersWithInfo: any[];
};

export default function ChartStack({ stages, usersWithInfo }: Props) {
  return (
    <BarChart
      width={500}
      height={300}
      data={usersWithInfo}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 5
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      {stages.map((stage, index) => (
        <Bar dataKey={stage.name} stackId="a" fill={getColors(index)} />
      ))}
    </BarChart>
  );
}
