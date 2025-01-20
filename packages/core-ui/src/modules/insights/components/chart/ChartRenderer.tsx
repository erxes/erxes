import React, { memo, useEffect, useRef, useState } from 'react';
import { ChartType, Colors, Tooltip } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Chart from "chart.js/auto";
import Spinner from "@erxes/ui/src/components/Spinner";

import {
  DATALABELS_CONFIGS,
  DEFAULT_CHART_COLORS,
  horizontalDottedLine
} from "./utils";
import { commarizeNumbers, formatNumbers } from "../../utils";
import ChartLegend from './ChartLegend';

Chart.register([Colors, ChartDataLabels, Tooltip]);

interface IChartProps {
  datasets?: any;
  dataset?: any;
  data?: number[];
  labels?: string[];
  options?: any;
  chartType: ChartType | string;
  title?: string;
  loading?: boolean;
  chartVariables?: any;
  chartHeight?: number;
  filter?: any;
}

const ChartRenderer = (props: IChartProps) => {
  const {
    labels,
    chartType,
    datasets,
    dataset,
    data,
    title,
    loading,
    chartHeight,
    options,
    chartVariables,
    filter
  } = props;

  const { templateType } = chartVariables;

  const chartRef = useRef<HTMLCanvasElement>(null);

  const [chartInstance, setChartInstance] = useState<Chart | null>(null);

  const [chartData, setChartData] = useState({
    labels: labels,
    datasets: datasets?.length ? datasets : dataset || [
      {
        label: title || 'Default Dataset',
        data,
        backgroundColor: DEFAULT_CHART_COLORS,
        borderColor: DEFAULT_CHART_COLORS.map(color => color.replace('0.6', '1')),
        borderWidth: 1,
        hidden: false
      }
    ]
  })

  if (loading) {
    return <Spinner />;
  }

  const formatType = templateType.toLowerCase().includes('time') || (filter?.measure || []).some((measure) => measure?.toLowerCase().includes('time') || measure?.toLowerCase().includes('duration')) ? 'time' : undefined

  const datalabelsConfig = DATALABELS_CONFIGS[chartType];

  let plugins: any = {
    datalabels: {
      display: "auto",
      formatter: (value, ctx) => {
        return formatNumbers(value, formatType, 'y')
      },
      ...datalabelsConfig
    },
    tooltip: {
      enabled: true,
      displayColors: false,
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || "";
          let value = context.parsed.y;

          if (label) {
            label += ": ";
          }

          if (formatType === "time") {
            return formatNumbers(value, formatType, 'x')
          }

          label += commarizeNumbers(value);

          return label;
        }
      }
    },
    legend: {
      display: false
    }
  };

  if (options && Object.keys(options).length) {
    plugins = {
      ...plugins,
      ...(options?.hasOwnProperty('plugins') ? options.plugins : {}),
    };
  }

  const DEFAULT_CONFIG = {
    type: chartType,
    data: chartData,
    plugins: [ChartDataLabels, horizontalDottedLine],
    // plugins: [ChartDataLabels],
    options: {
      responsive: true,
      layout: {
        padding: {
          top: 20
        }
      },
      scales: {
        y: {
          ticks: {
            callback: (context, index) => {
              return formatNumbers(context, formatType, 'y')
            }
          }
        }
      },
      ...options,
      plugins,
      elements: {
        line: {
          fill: true,
          tension: 0.4
        }
      }
    }
  };

  useEffect(() => {
    if (chartRef.current) {
      const chart: any = new Chart(chartRef.current, DEFAULT_CONFIG);

      setChartInstance(chart);

      return () => {
        chart.destroy();
      };
    }
  }, [chartType]);

  useEffect(() => {
    if (chartInstance) {
      chartInstance.data = chartData;
      chartInstance.update();
    }

  }, [chartData, chartInstance]);

  const handleLegendClick = (index: number) => {
    if (chartInstance) {
      setChartData(prevData => {
        const newData = { ...prevData };
        newData.datasets = [...prevData.datasets];
        newData.datasets[index] = { ...newData.datasets[index] };
        newData.datasets[index].hidden = !newData.datasets[index].hidden;
        return newData;
      });
    }
  }

  const handleColorChange = (index: number, color: string) => {
    if (chartInstance) {
      setChartData(prevData => {
        const newData = { ...prevData };
        newData.datasets = [...prevData.datasets];
        newData.datasets[index] = { ...newData.datasets[index] };
        newData.datasets[index].backgroundColor = color;
        newData.datasets[index].borderColor = color.replace('0.6', '1');
        return newData;
      });
    }
  }

  return (
    <div
      className="canvas"
      style={{ width: `auto`, height: `${chartHeight}px`, display: 'flex', justifyContent: 'center', position: 'relative' }}
    >
      <ChartLegend chart={chartData} onClick={handleLegendClick} onColorChange={handleColorChange} />
      <canvas ref={chartRef} style={{ marginTop: '30px' }} />
    </div>
  );
};

export default memo(ChartRenderer);
