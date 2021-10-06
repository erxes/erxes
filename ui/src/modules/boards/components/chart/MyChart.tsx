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
        label: 'doing',
        data: [
          ['Bat', 5],
          ['Dorj', 2]
        ]
      },
      {
        label: 'planned',
        data: [
          ['Bat', 3],
          ['Dorj', 1],
          ['Dulam', 5]
        ]
      },
      {
        label: 'testing',
        data: [
          ['Bat', 1],
          ['Dorj', 3],
          ['Tsetseg', 1]
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
      <div style={{ width: '800px', height: '600px' }}>
        <Chart
          data={data}
          series={series}
          axes={axes}
          primaryCursor
          tooltip={tooltip}
        />
      </div>
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
