import { ChartType } from 'chart.js';
import Chart from 'chart.js/auto';
import React, { useEffect, useRef } from 'react';
import {
  DEFAULT_BACKGROUND_COLORS,
  DEFAULT_BORDER_COLORS,
  DEFAULT_DATA_PER_CHART,
  DEFAULT_LABELS_PER_CHART
} from './utils';

interface IChartProps {
  data?: number[];
  labels?: string[];
  template?: string;
  chartType: ChartType | string;
  name?: string;
}

const ChartRenderer = (props: IChartProps) => {
  const { labels, chartType, data } = props;

  console.log('renderer   ', chartType);
  const chartRef = useRef<HTMLCanvasElement>(null);

  const chartData = {
    labels: labels || DEFAULT_LABELS_PER_CHART[chartType],
    datasets: [
      {
        label: 'Default Dataset',
        data: data || DEFAULT_DATA_PER_CHART[chartType],
        backgroundColor: DEFAULT_BACKGROUND_COLORS,
        borderColor: DEFAULT_BORDER_COLORS,
        borderWidth: 1
      }
    ]
  };

  const DEFAULT_CONFIG = {
    type: chartType,
    data: chartData
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
