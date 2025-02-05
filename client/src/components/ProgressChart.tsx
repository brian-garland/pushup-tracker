import React from 'react';
import { Card, CardContent, Typography, styled, alpha } from '@mui/material';
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

const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.dark}22 0%, ${theme.palette.secondary.dark}22 100%)`,
  backdropFilter: 'blur(10px)',
  '& .MuiCardContent-root': {
    position: 'relative',
    zIndex: 1,
  },
}));

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
          entry.count >= dailyGoal
            ? 'rgba(183, 148, 244, 0.8)' // theme.palette.primary.main with opacity
            : 'rgba(246, 135, 179, 0.6)' // theme.palette.secondary.main with opacity
        ),
        borderColor: sortedEntries.map(entry =>
          entry.count >= dailyGoal
            ? 'rgb(183, 148, 244)' // theme.palette.primary.main
            : 'rgb(246, 135, 179)' // theme.palette.secondary.main
        ),
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        type: 'line' as const,
        label: 'Daily Goal',
        data: sortedEntries.map(() => dailyGoal),
        fill: false,
        borderColor: 'rgba(255, 255, 255, 0.5)',
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
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            weight: 500,
          },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(26, 32, 44, 0.9)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.9)',
        padding: 12,
        cornerRadius: 8,
        boxPadding: 4,
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
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          font: {
            family: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          },
        },
        title: {
          display: true,
          text: 'Number of Pushups',
          color: 'rgba(255, 255, 255, 0.9)',
          font: {
            family: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            weight: 500,
          },
        },
      },
    },
  };

  return (
    <GradientCard>
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: (theme) => alpha(theme.palette.common.white, 0.9),
            mb: 3,
          }}
        >
          Progress Overview
        </Typography>
        <div style={{ height: '300px', position: 'relative' }}>
          <Chart type="bar" data={data} options={options} />
        </div>
      </CardContent>
    </GradientCard>
  );
};

export default ProgressChart; 