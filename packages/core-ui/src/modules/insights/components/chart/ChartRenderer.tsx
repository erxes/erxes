import React, { memo, useEffect, useRef } from "react";
import { ChartType, Colors, Tooltip } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Chart from "chart.js/auto";
import Spinner from "@erxes/ui/src/components/Spinner";

import {
  DATALABELS_CONFIGS,
  DEFAULT_BACKGROUND_COLORS,
  DEFAULT_BORDER_COLORS,
  horizontalDottedLine
} from "./utils";
import { commarizeNumbers, formatNumbers } from "../../utils";

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
    chartVariables
  } = props;

  const { templateType } = chartVariables;

  if (loading) {
    return <Spinner />;
  }

  const chartRef = useRef<HTMLCanvasElement>(null);
  const formatType = templateType.toLowerCase().includes("time")
    ? "time"
    : undefined;

  const chartData = {
    labels: labels,
    datasets: datasets?.length
      ? datasets
      : dataset || [
          {
            label: title || "Default Dataset",
            data,
            backgroundColor: DEFAULT_BACKGROUND_COLORS,
            borderColor: DEFAULT_BORDER_COLORS,
            borderWidth: 1
          }
        ]
  };

  const datalabelsConfig = DATALABELS_CONFIGS[chartType];

  let plugins: any = {
    datalabels: {
      display: "auto",
      formatter: (value, ctx) => {
        return formatNumbers(value, "y", formatType);
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
            return formatNumbers(value, "x", formatType);
          }

          label += commarizeNumbers(value);

          return label;
        }
      }
    }
  };

  if (options && Object.keys(options).length) {
    plugins = {
      ...plugins,
      legend: { labels: { boxWidth: 0, boxHeight: 0 } },
      ...(options?.hasOwnProperty("plugins") ? options.plugins : {})
    };
  }

  const DEFAULT_CONFIG = {
    type: chartType,
    data: chartData,
    plugins: [ChartDataLabels, horizontalDottedLine],
    // plugins: [ChartDataLabels],
    options: {
      scales: {
        y: {
          ticks: {
            callback: (context, index) => {
              return formatNumbers(context, "y", formatType);
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
      return () => {
        chart.destroy();
      };
    }
  }, [chartType]);

  return (
    <div
      className="canvas"
      style={{
        width: `auto`,
        height: `${chartHeight}px`,
        display: "flex",
        justifyContent: "center"
      }}
    >
      <canvas ref={chartRef} />
    </div>
  );
};

export default memo(ChartRenderer);
