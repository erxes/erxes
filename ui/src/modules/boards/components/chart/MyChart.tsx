import React from 'react';
import { Chart } from 'react-charts';

export default () => {
  const series = React.useMemo(() => ({ type: 'bar' }), []);
  const axes = React.useMemo(
    () => [
      { primary: true, position: 'bottom', type: 'ordinal' },
      { position: 'left', type: 'linear', stacked: true }
    ],
    []
  );

  const data = React.useMemo(
    () => [
      {
        label: 'Series 1',
        data: [
          [0, 5],
          [1, 2],
          [2, 4],
          [3, 6],
          [4, 7]
        ]
      },
      {
        label: 'Series 2',
        data: [
          [0, 3],
          [1, 1],
          [2, 5],
          [3, 6],
          [4, 4]
        ]
      }
    ],
    []
  );

  const tooltip = React.useMemo(
    () => ({
      render: ({ datum, primaryAxis, getStyle }) => {
        return <CustomTooltip {...{ getStyle, primaryAxis, datum }} />;
      }
    }),
    []
  );

  return (
    <>
      <Chart
        data={data}
        series={series}
        axes={axes}
        primaryCursor
        tooltip={tooltip}
      />
    </>
  );
};

function CustomTooltip({ getStyle, primaryAxis, datum }) {
  const data = React.useMemo(
    () =>
      datum
        ? [
            {
              data: datum.group.map(d => ({
                primary: d.series.label,
                secondary: d.secondary,
                color: getStyle(d).fill
              }))
            }
          ]
        : [],
    [datum, getStyle]
  );
  return datum ? (
    <div
      style={{
        color: 'white',
        pointerEvents: 'none'
      }}
    >
      <h3
        style={{
          display: 'block',
          textAlign: 'center'
        }}
      >
        {primaryAxis.format(datum.primary)}
      </h3>
      <div
        style={{
          width: '300px',
          height: '200px',
          display: 'flex'
        }}
      >
        <Chart
          data={data}
          dark
          series={{ type: 'bar' }}
          axes={[
            {
              primary: true,
              position: 'bottom',
              type: 'ordinal'
            },
            {
              position: 'left',
              type: 'linear'
            }
          ]}
          getDatumStyle={datum => ({
            color: datum.originalDatum.color
          })}
          primaryCursor={{
            value: datum.seriesLabel
          }}
        />
      </div>
    </div>
  ) : null;
}
