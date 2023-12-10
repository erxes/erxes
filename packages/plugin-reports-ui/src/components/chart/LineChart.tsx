import React, { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';

const DATA_COUNT = 7;
const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };

const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: [1, 2, 3, 4, 5, 6, 7],
      borderColor: 'rgba(255, 99, 132, 0.6)',
      backgroundColor: 'rgba(255, 99, 132, 0.6)'
    },
    {
      label: 'Dataset 2',
      data: [0, 2, 3, 4, 6, 7],
      borderColor: 'rgba(255, 206, 86, 0.6)',
      backgroundColor: 'rgba(255, 206, 86, 0.6)'
    }
  ]
};

// const config = {
//   type: 'line',
//   data,
//   options: {
//     responsive: true,
//     plugins: {
//       legend: {
//         position: 'top'
//       },
//       title: {
//         display: true,
//         text: 'Line chart'
//       }
//     }
//   }
// };

const config = {
  type: 'bar',
  data: {
    datasets: [
      {
        data: [20, 10],
        borderColor: ['rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)'],
        backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(255, 206, 86, 0.6)']
      }
    ],
    labels: ['a', 'b']
  }
};

export default function LineChart() {
  const chartRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (chartRef.current) {
      const chart = new Chart(chartRef.current!, config);
      return () => {
        chart.destroy();
      };
    }
  }, []);

  return <canvas id="linearChart" ref={chartRef} />;
}
