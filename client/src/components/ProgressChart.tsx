import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { format } from 'date-fns';
import type { PushupEntry } from '../types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ProgressChartProps {
  entries: PushupEntry[];
  dailyGoal: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({ entries, dailyGoal }) => {
  // Sort entries by date
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const data: ChartData<'bar' | 'line'> = {
    labels: sortedEntries.map(entry => format(new Date(entry.date), 'MMM dd')),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Pushups',
        data: sortedEntries.map(entry => entry.count),
        backgroundColor: sortedEntries.map(entry =>
          entry.goalMet ? 'rgba(75, 192, 192, 0.8)' : 'rgba(255, 99, 132, 0.8)'
        ),
        borderColor: sortedEntries.map(entry =>
          entry.goalMet ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)'
        ),
        borderWidth: 1,
      },
      {
        type: 'line' as const,
        label: 'Daily Goal',
        data: sortedEntries.map(() => dailyGoal),
        fill: false,
        borderColor: 'rgba(54, 162, 235, 0.8)',
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  };

  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} pushups`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Pushups',
        },
      },
    },
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Progress Overview
        </Typography>
        <div style={{ height: '300px', position: 'relative' }}>
          <Chart type="bar" data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressChart; 