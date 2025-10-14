// 雷达图组件 - 显示7个维度的分数

import { useEffect, useRef } from 'react';
import './RadarChart.css';

interface DimensionScores {
  teamConnection: number;
  appreciation: number;
  responsiveness: number;
  trustPositivity: number;
  conflictManagement: number;
  goalSupport: number;
  warningSigns: number;
}

interface RadarChartProps {
  scores: DimensionScores;
}

const RadarChart = ({ scores }: RadarChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    const size = 400;
    canvas.width = size;
    canvas.height = size;
    const center = size / 2;
    const maxRadius = size / 2 - 60;

    // 清空画布
    ctx.clearRect(0, 0, size, size);

    // 维度标签和对应分数
    const dimensions = [
      { label: 'Team\nConnection', score: scores.teamConnection, key: 'teamConnection' },
      { label: 'Appreciation', score: scores.appreciation, key: 'appreciation' },
      { label: 'Responsiveness', score: scores.responsiveness, key: 'responsiveness' },
      { label: 'Trust &\nPositivity', score: scores.trustPositivity, key: 'trustPositivity' },
      { label: 'Conflict\nManagement', score: scores.conflictManagement, key: 'conflictManagement' },
      { label: 'Goal\nSupport', score: scores.goalSupport, key: 'goalSupport' },
      { label: 'Healthy\nCommunication', score: scores.warningSigns, key: 'warningSigns' },
    ];

    const angleStep = (Math.PI * 2) / dimensions.length;

    // 绘制背景网格（5个同心圆）
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      const radius = (maxRadius / 5) * i;
      for (let j = 0; j <= dimensions.length; j++) {
        const angle = angleStep * j - Math.PI / 2;
        const x = center + radius * Math.cos(angle);
        const y = center + radius * Math.sin(angle);
        if (j === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.closePath();
      ctx.stroke();
    }

    // 绘制轴线
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    dimensions.forEach((_, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const x = center + maxRadius * Math.cos(angle);
      const y = center + maxRadius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(x, y);
      ctx.stroke();
    });

    // 绘制数据区域
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    dimensions.forEach((dimension, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const normalizedScore = dimension.score / 100; // 0-100 归一化到 0-1
      const radius = maxRadius * normalizedScore;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 绘制数据点
    ctx.fillStyle = '#3b82f6';
    dimensions.forEach((dimension, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const normalizedScore = dimension.score / 100;
      const radius = maxRadius * normalizedScore;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);

      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 绘制维度标签
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    dimensions.forEach((dimension, index) => {
      const angle = angleStep * index - Math.PI / 2;
      const labelRadius = maxRadius + 35;
      const x = center + labelRadius * Math.cos(angle);
      const y = center + labelRadius * Math.sin(angle);

      // 处理多行标签
      const lines = dimension.label.split('\n');
      lines.forEach((line, lineIndex) => {
        const lineY = y + (lineIndex - (lines.length - 1) / 2) * 14;
        ctx.fillText(line, x, lineY);
      });

      // 绘制分数
      ctx.font = '11px Arial';
      ctx.fillStyle = '#6b7280';
      const scoreY = y + lines.length * 7 + 8;
      ctx.fillText(dimension.score.toFixed(1), x, scoreY);
    });
  }, [scores]);

  return (
    <div className="radar-chart-container">
      <canvas ref={canvasRef} className="radar-chart-canvas" />
    </div>
  );
};

export default RadarChart;




