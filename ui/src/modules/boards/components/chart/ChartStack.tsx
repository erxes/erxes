import React from 'react';
import { Chart } from 'react-charts';
import { ChartContainer } from 'modules/boards/styles/common';

export default ({ chartData }: { chartData: any }) => {
  const series = React.useMemo(() => ({ type: 'bar' }), []);
  const axes = React.useMemo(
    () => [
      {
        primary: true,
        position: 'bottom',
        type: 'ordinal',
        innerPadding: 0.5,
        outerPadding: 0
      },
      {
        position: 'left',
        type: 'linear',
        stacked: true,
        tickSizeInner: 0,
        showTicks: true
      }
    ],
    []
  );

  const data = React.useMemo(
    () =>
      Object.keys(chartData).map(key => ({
        label: key,
        data: chartData[key].map(data => ({
          primary:
            data.user.details.fullName || data.user.details.email || 'Name',
          secondary: data.count
        }))
      })),
    [chartData]
  );

  return (
    <ChartContainer>
      <Chart data={data} series={series} axes={axes} tooltip />
    </ChartContainer>
  );
};
