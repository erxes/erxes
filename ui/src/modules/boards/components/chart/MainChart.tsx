import React from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default function MainChart({ component, data, children }) {
  const ChartComponent = component;

  return (
    <ResponsiveContainer width="100%" height="100%" backgroundColor="#ffffff">
      <ChartComponent
        data={data}
        margin={{ top: 100, left: 130, bottom: 150, right: 200 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" padding={{ top: 10 }} />
        <YAxis padding={{ right: 10 }} />
        <Tooltip />
        <Legend height={0} />
        {children}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
