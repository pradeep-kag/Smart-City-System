import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function TrafficChart({ data, area = "Main Junction" }) {
  const chartData = {
    labels: data.map(d => d.time + ':00'),
    datasets: [
      {
        fill: true,
        label: `Traffic Volume: ${area}`,
        data: data.map(d => d.traffic),
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#2563EB',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        pointRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top', 
        align: 'end',
        labels: { 
          color: '#475569',
          font: { family: 'Inter', weight: '600', size: 12 },
          usePointStyle: true,
          padding: 20
        } 
      },
      tooltip: {
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { family: 'Inter', size: 13 },
        bodyFont: { family: 'Inter', size: 13 },
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: {
      x: { 
        ticks: { color: '#94a3b8', font: { size: 11 } }, 
        grid: { display: false } 
      },
      y: { 
        min: 0,
        max: 100,
        ticks: { color: '#94a3b8', font: { size: 11 }, stepSize: 20 }, 
        grid: { color: '#f1f5f9' } 
      }
    },
    animations: {
      tension: { duration: 1000, easing: 'linear' }
    }
  };

  return <Line options={options} data={chartData} />;
}
