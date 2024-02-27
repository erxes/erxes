import React, { memo, useEffect, useRef } from 'react';
import { ChartType, Colors } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import Chart from 'chart.js/auto';

import Spinner from '@erxes/ui/src/components/Spinner';

import {
  DEFAULT_BACKGROUND_COLORS,
  DEFAULT_BORDER_COLORS,
  DEFAULT_DATA_PER_CHART,
  DEFAULT_LABELS_PER_CHART,
} from './utils';

Chart.register(Colors);

interface IChartProps {
  datasets?: any;

  data?: number[];
  labels?: string[];
  template?: string;
  options?: any;
  chartType: ChartType | string;
  name?: string;
  title?: string;
  loading?: boolean;

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
  } = props;

  if (loading) {
    return <Spinner />;
  }

  const chartRef = useRef<HTMLCanvasElement>(null);

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

  if (chartType === 'pie') {
    Chart.register(ChartDataLabels);
  }

  let plugins: any = {
    datalabels: { color: 'white', formatter: (value, ctx) => value },
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
    options: { ...options, plugins },
  };

  useEffect(() => {
    if (chartRef.current) {
      const chart = new Chart(chartRef.current, DEFAULT_CONFIG);
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
