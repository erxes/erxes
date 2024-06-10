import React, { memo, useEffect, useRef } from 'react';
import { ChartType, Colors, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Chart from 'chart.js/auto';
import Spinner from '@erxes/ui/src/components/Spinner';

import {
  DEFAULT_BACKGROUND_COLORS,
  DEFAULT_BORDER_COLORS,
} from './utils';
import {
  commarizeNumbers,
  formatNumbers,
} from '../../utils';


Chart.register([Colors, ChartDataLabels, Tooltip]); 

interface IChartProps {
  datasets?: any;

  data?: number[];
  labels?: string[];
  options?: any;
  chartType: ChartType | string;
  title?: string;
  loading?: boolean;
  chartVariables?: any
  chartHeight?: number;
}

const ChartRenderer = (props: IChartProps) => {
  const {
    labels,
    chartType,
    datasets,
    data,
    title,
    loading,
    chartHeight,
    options,
    chartVariables
  } = props;

  const { templateType } = chartVariables

  if (loading) {
    return <Spinner />;
  }

  const chartRef = useRef<HTMLCanvasElement>(null);
  const formatType = templateType.toLowerCase().includes('time') ? 'time' : undefined

  const chartData = {
    labels: labels,
    datasets: datasets || [
      {
        label: title || 'Default Dataset',
        data,
        backgroundColor: DEFAULT_BACKGROUND_COLORS,
        borderColor: DEFAULT_BORDER_COLORS,
        borderWidth: 1,
      },
    ],
  };

  let plugins: any = {
    datalabels: {
      display: 'auto',
      color: 'white', formatter: (value, ctx) => {
        return formatNumbers(value, 'y', formatType)
      }
    },
    tooltip: {
      enabled: true,
      displayColors: false,
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || '';
          let value = context.parsed.y

          if (label) {
            label += ': ';
          }

          if (formatType === 'time') {
            return formatNumbers(value, 'x', formatType)
          }

          label += commarizeNumbers(value);

          return label;
        }
      }
    }
  };

  if (!datasets) {
    plugins = {
      ...plugins,
      legend: { labels: { boxWidth: 0, boxHeight: 0 } },
    };
  }

  const DEFAULT_CONFIG = {
    type: chartType,
    data: chartData,
    plugins: [ChartDataLabels],
    // options: { ...options, plugins },
    options: {
      scales: {
        y: {
          ticks: {
            callback: ((context, index) => {
              return formatNumbers(context, 'y', formatType)
            })
          }
        }
      },
      ...options, plugins
    }
  };

  useEffect(() => {
    if (chartRef.current) {
      const chart: any = new Chart(chartRef.current, DEFAULT_CONFIG);
      return () => {
        chart.destroy();
      };
    }
  }, [chartType]);

  return (
    <div
      className="canvas"
      style={{ width: `auto`, height: `${chartHeight}px` }}
    >
      <canvas ref={chartRef} />
    </div>
  );
};

export default memo(ChartRenderer);
