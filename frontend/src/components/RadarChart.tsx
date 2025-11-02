import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';  // ⬅️ 使用 type 导入
import { Radar } from 'react-chartjs-2';
import './RadarChart.css';

// 注册 Chart.js 组件
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  personalScores: {
    teamConnection: number;
    appreciation: number;
    responsiveness: number;
    trustPositivity: number;
    conflictManagement: number;
    goalSupport: number;
    warningSigns: number;
  };
  teamScores: {
    teamConnection: number;
    appreciation: number;
    responsiveness: number;
    trustPositivity: number;
    conflictManagement: number;
    goalSupport: number;
    warningSigns: number;
  };
}

function RadarChart({ personalScores, teamScores }: RadarChartProps) {
  // 维度标签（按照要求的顺序，带emoji图标）
  const labels = [
    '🤝 Team Connection',
    '🙏 Appreciation',
    '👂 Responsiveness',
    '✨ Trust & Positivity',
    '⚖️ Conflict Management',
    '🎯 Goal Support',
    '💬 Healthy Communication',
  ];

  // 提取个人分数数据
  const personalData = [
    personalScores.teamConnection,
    personalScores.appreciation,
    personalScores.responsiveness,
    personalScores.trustPositivity,
    personalScores.conflictManagement,
    personalScores.goalSupport,
    personalScores.warningSigns, // 这对应 "Healthy Communication"
  ];

  // 提取团队平均分数数据
  const teamData = [
    teamScores.teamConnection,
    teamScores.appreciation,
    teamScores.responsiveness,
    teamScores.trustPositivity,
    teamScores.conflictManagement,
    teamScores.goalSupport,
    teamScores.warningSigns,
  ];

  // 图表数据配置
  const data = {
    labels: labels,
    datasets: [
      {
        label: 'Your Score',
        data: personalData,
        backgroundColor: 'rgba(59, 130, 246, 0.2)', // 蓝色半透明
        borderColor: '#3b82f6', // 蓝色边框
        borderWidth: 2,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3b82f6',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Team Average',
        data: teamData,
        backgroundColor: 'rgba(245, 158, 11, 0.2)', // 橙色半透明
        borderColor: '#f59e0b', // 橙色边框
        borderWidth: 2,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#f59e0b',
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // 图表选项配置
  const options: ChartOptions<'radar'> = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        beginAtZero: true,
        ticks: {
          stepSize: 20,
          font: {
            size: 12,
          },
        },
        pointLabels: {
          font: {
            size: 14,
            weight: 'bold',
          },
          color: '#1f2937',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 14,
            weight: 'bold',
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context) {
            return `${context.dataset.label}: ${context.parsed.r.toFixed(1)}`;
          },
        },
      },
    },
  };

  return (
    <div className="radar-chart-container">
      <Radar data={data} options={options} />
    </div>
  );
}

export default RadarChart;