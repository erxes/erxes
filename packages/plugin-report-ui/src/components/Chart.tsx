import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface IChartProps {
  data: number[];
  labels: string[];
}

const TestChart: React.FC<IChartProps> = ({ data, labels }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const myChart = new Chart(chartRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Test Chart',
              data,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
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
      });
    }
  }, [data, labels]);

  return <canvas ref={chartRef} />;
};

export default TestChart;
