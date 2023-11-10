import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import {
  ChartConfiguration,
  ChartConfigurationCustomTypesPerDataset,
  ChartOptions,
  ChartType,
  Colors
} from 'chart.js';
import { IChart } from '../../types';
import { DEFAULT_BACKGROUND_COLORS, DEFAULT_BORDER_COLORS } from './utils';

Chart.register(Colors);

interface IChartProps {
  chart: IChart;

  data?: number[];
  labels?: string[];
  template?: string;
  chartType?: ChartType;
  name?: string;
}

const CHART_DEFAULT_SCALES = {
  y: {
    min: 0,
    max: 100
  }
};

const ChartComponent: React.FC<IChartProps> = ({
  data,
  labels,
  chartType,
  name
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const config:
        | ChartConfiguration
        | ChartConfigurationCustomTypesPerDataset =
        //   {
        //   type: chartType,
        //   data: {
        //     datasets: [
        //       {
        //         data: [
        //           { id: 'Sales', nested: { value: 1500 } },
        //           { id: 'Purchases', nested: { value: 500 } }
        //         ]
        //       }
        //     ]
        //   },
        //   options: {
        //     parsing: {
        //       xAxisKey: 'id',
        //       yAxisKey: 'nested.value'
        //     }
        //   }
        // };

        {
          type: 'line',
          data: {
            labels,
            datasets: [
              // {
              //   type: 'bar',
              //   label: name,
              //   data,
              //   backgroundColor: [
              //     'rgba(255, 99, 132, 0.6)',
              //     'rgba(54, 162, 235, 0.6)',
              //     'rgba(255, 206, 86, 0.6)',
              //     'rgba(75, 192, 192, 0.6)',
              //     'rgba(153, 102, 255, 0.6)',
              //     'rgba(255, 159, 64, 0.6)'
              //   ],

              //   borderColor: [
              //     'rgba(255, 99, 132, 1)',
              //     'rgba(54, 162, 235, 1)',
              //     'rgba(255, 206, 86, 1)',
              //     'rgba(75, 192, 192, 1)',
              //     'rgba(153, 102, 255, 1)',
              //     'rgba(255, 159, 64, 1)'
              //   ],
              //   borderWidth: 1
              // },

              {
                label: 'Bar chart 2',
                data: [0, 2, 3, 4, 6, 7],
                backgroundColor: [
                  'rgba(255, 99, 132, 0.6)',
                  'rgba(54, 162, 235, 0.6)',
                  'rgba(255, 206, 86, 0.6)',
                  'rgba(75, 192, 192, 0.6)',
                  'rgba(153, 102, 255, 0.6)',
                  'rgba(255, 159, 64, 0.6)'
                ],

                borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
              }
            ]
          },
          options: {
            scales: {
              yAxes: [
                {
                  ticks: {
                    beginAtZero: true
                  }
                }
              ]
            }
          }
        };

      // {
      //   type: 'line',
      //   data: {
      //     datasets: [
      //       {
      //         data: [
      //           { x: '2016-12-25', y: 20 },
      //           { x: '2016-12-26', y: 10 }
      //         ]
      //       }
      //     ]
      //   },
      //   options: {
      //     responsive: true,
      //     plugins: {
      //       legend: {
      //         position: 'top'
      //       },
      //       title: {
      //         display: true,
      //         text: 'Chart.js Bar Chart'
      //       }
      //     }
      //   }
      // };

      // {
      //   type: 'line',
      //   data: {
      //     datasets: [
      //       {
      //         data: {
      //           January: 10,
      //           February: 20
      //         }
      //       }
      //     ]
      //   }
      // };

      const options: ChartOptions = {};

      const cfg = {
        type: 'bar',
        data: {
          datasets: [
            {
              data: [0, 1, 1],
              backgroundColor: DEFAULT_BACKGROUND_COLORS,
              borderColor: DEFAULT_BORDER_COLORS
            }
          ],
          labels: ['Ariuka ', 'Enkhtuvshin Narmandakh', 'Erdembileg Ebi']
        }
      };
      const myChart = new Chart(chartRef.current, cfg);

      // setChartImageUrl(myChart.toBase64Image('image/png', 1));
      return () => {
        myChart.destroy();
      };
    }
  }, [data, labels]);

  return <canvas ref={chartRef} />;
};

export default ChartComponent;
