import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

type Props = {
  data: any;
  component: typeof React.Component;
  children: React.ReactNode;
};

export default function MainChart({ component, data, children }: Props) {
  const ChartComponent = component;

  const CustomizedAxisTick = props => {
    const { x, y, payload } = props;

    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="end"
          fill="#666"
          transform="rotate(-35)"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ChartComponent
        data={data}
        margin={{ top: 100, left: 130, bottom: 150, right: 200 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          padding={{ top: 10 }}
          label={{
            value: 'Assignees',
            position: 'insideBottomRight',
            offset: 0
          }}
          tick={<CustomizedAxisTick />}
          height={60}
          interval={0}
          angle={30}
          dx={20}
        />
        <YAxis
          label={{
            value: 'Number of tasks by stages',
            angle: -90,
            position: 'insideLeft'
          }}
          padding={{ right: 10 }}
        />
        <Tooltip />
        <Legend verticalAlign="top" height={36} />
        {children}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
