import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import {
  ChartConfiguration,
  ChartConfigurationCustomTypesPerDataset,
  ChartOptions,
  ChartType,
  Colors
} from 'chart.js';
import { IChart } from '../../types';
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
  chartType: ChartType;
  name?: string;
}

const ChartRenderer = (props: IChartProps) => {
  const { labels, chartType, data } = props;

  const chartRef = useRef<HTMLCanvasElement>(null);

  const chartData = {
    labels: labels || DEFAULT_LABELS_PER_CHART[chartType],
    datasets: [
      {
        label: 'My First Dataset',
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
  }, [data, labels, chartType]);

  return (
    <>
      <canvas ref={chartRef} />
      <div>asdasd</div>
    </>
  );
};

export default ChartRenderer;
