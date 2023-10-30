import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const FunnelChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const myChartRef = chartRef.current.getContext('2d');

      const funnelChart = new Chart(myChartRef, {
        type: 'horizontalBar',
        data: {
          labels: data.labels,
          datasets: [
            {
              label: data.title,
              data: data.values,
              backgroundColor: data.colors
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false
          },
          scales: {
            xAxes: [
              {
                ticks: {
                  beginAtZero: true
                }
              }
            ],
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
  }, [data]);

  return <canvas ref={chartRef} />;
};

export default FunnelChart;
