import { ChartType, Colors } from 'chart.js';
import Chart from 'chart.js/auto';
import React, { useEffect, useRef } from 'react';
import {
  DEFAULT_BACKGROUND_COLORS,
  DEFAULT_BORDER_COLORS,
  DEFAULT_DATA_PER_CHART,
  DEFAULT_LABELS_PER_CHART
} from './utils';
import { Spinner } from '@erxes/ui/src/components';

Chart.register(Colors);

interface IChartProps {
  datasets?: any;

  data?: number[];
  labels?: string[];
  template?: string;
  chartType: ChartType | string;
  name?: string;
  title?: string;
  loading?: boolean;
}

const ChartRenderer = (props: IChartProps) => {
  const { labels, chartType, datasets, data, title, loading } = props;

  if (loading) {
    return <Spinner />;
  }

  const chartRef = useRef<HTMLCanvasElement>(null);

  const chartData = {
    labels: labels || DEFAULT_LABELS_PER_CHART[chartType],
    datasets: datasets || [
      {
        label: title || 'Default Dataset',
        data: data || DEFAULT_DATA_PER_CHART[chartType],
        backgroundColor: DEFAULT_BACKGROUND_COLORS,
        borderColor: DEFAULT_BORDER_COLORS,
        borderWidth: 1
      }
    ]
  };

  const DEFAULT_CONFIG = {
    type: chartType,
    data: chartData,
    options: datasets
      ? {}
      : { plugins: { legend: { labels: { boxWidth: 0, boxHeight: 0 } } } }
  };

  useEffect(() => {
    if (chartRef.current) {
      const chart = new Chart(chartRef.current, DEFAULT_CONFIG);
      return () => {
        chart.destroy();
      };
    }
  }, [chartData, chartType]);

  return (
    <>
      <canvas ref={chartRef} />
    </>
  );
};

export default ChartRenderer;
