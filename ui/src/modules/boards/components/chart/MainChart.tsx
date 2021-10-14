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
    <ResponsiveContainer width="100%" height="100%">
      <ChartComponent
        data={data}
        margin={{ top: 50, left: 50, bottom: 50, right: 50 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {children}
      </ChartComponent>
    </ResponsiveContainer>
  );
}
