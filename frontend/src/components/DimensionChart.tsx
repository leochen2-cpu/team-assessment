/**
 * 维度对比图表组件
 * 
 * 放置位置: frontend/src/components/DimensionChart.tsx
 * 
 * 依赖: recharts
 * 安装: npm install recharts
 */

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { DimensionScores, DIMENSION_NAMES } from '../types/organization';

interface DimensionChartProps {
  dimensionAverages: DimensionScores;
  type?: 'bar' | 'radar';
  height?: number;
}

/**
 * 维度对比图表（柱状图或雷达图）
 */
export const DimensionChart: React.FC<DimensionChartProps> = ({
  dimensionAverages,
  type = 'bar',
  height = 400,
}) => {
  // 转换数据为图表格式
  const chartData = Object.entries(dimensionAverages).map(([key, value]) => ({
    dimension: DIMENSION_NAMES[key as keyof DimensionScores],
    score: value,
    fullMark: 100,
  }));

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900">{data.payload.dimension}</p>
          <p className="text-blue-600 font-bold text-lg">{data.value.toFixed(1)} Points</p>
        </div>
      );
    }
    return null;
  };

  // 柱状图
  if (type === 'bar') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Dimensional performance comparison</h3>
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="dimension"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="score"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              label={{ position: 'top', fill: '#1f2937', fontSize: 12 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 雷达图
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Dimensional Radar Chart</h3>
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 10 }}
          />
          <Radar
            name="Dimentional scores"
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

interface TeamComparisonChartProps {
  teams: Array<{
    teamName: string;
    teamScore: number;
  }>;
  height?: number;
}

/**
 * 团队分数对比柱状图
 */
export const TeamComparisonChart: React.FC<TeamComparisonChartProps> = ({
  teams,
  height = 400,
}) => {
  // 为每个团队设置颜色
  const getColor = (score: number) => {
    if (score >= 90) return '#10b981'; // green
    if (score >= 75) return '#3b82f6'; // blue
    if (score >= 50) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const chartData = teams.map((team) => ({
    ...team,
    fill: getColor(team.teamScore),
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900">{data.payload.teamName}</p>
          <p className="text-blue-600 font-bold text-lg">
            {data.value.toFixed(1)} Points
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Team score ranking</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="teamName"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            label={{
              value: 'Team score',
              angle: -90,
              position: 'insideLeft',
              fill: '#6b7280',
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="teamScore"
            radius={[8, 8, 0, 0]}
            label={{ position: 'top', fill: '#1f2937', fontSize: 12 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DimensionChart;
