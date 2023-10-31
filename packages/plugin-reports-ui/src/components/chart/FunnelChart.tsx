import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const FunnelChart = ({ data }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      const funnelChart = new Chart(chartRef.current!, {
        type: 'bar',
        data: {
          labels: data.labels,
          datasets: [
            {
              label: data.title,
              data: data.values,
              backgroundColor: [
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)'
              ],
              borderWidth: 1,
              borderSkipped: true
            }
          ]
        },
        options: {
          indexAxis: 'y',
          scales: {
            y: {
              beginAtZero: true
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: { enabled: false }
          }
        }
      });

      return () => {
        funnelChart.destroy();
      };
    }
  }, [data]);

  return <canvas ref={chartRef} />;
};

export default FunnelChart;
