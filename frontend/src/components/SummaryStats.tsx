/**
 * 统计卡片组件
 * 
 * 放置位置: frontend/src/components/SummaryStats.tsx
 */

import React from 'react';
import { getScoreColorClass, getScoreBgColorClass } from '../types/organization';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  colorClass?: string;
  bgColorClass?: string;
}

/**
 * 单个统计卡片
 */
export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  colorClass = 'text-blue-600',
  bgColorClass = 'bg-blue-50',
}) => {
  return (
    <div className={`${bgColorClass} rounded-lg p-6 border border-gray-200`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${colorClass} mb-1`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
        {icon && <div className={`${colorClass} opacity-20 text-4xl`}>{icon}</div>}
      </div>
    </div>
  );
};

interface SummaryStatsProps {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  completedTeams: number;
  totalTeams: number;
  healthGrade: string;
}

/**
 * 汇总报告统计卡片组
 */
export const SummaryStats: React.FC<SummaryStatsProps> = ({
  averageScore,
  highestScore,
  lowestScore,
  completedTeams,
  totalTeams,
  healthGrade,
}) => {
  const completionRate = totalTeams > 0 ? Math.round((completedTeams / totalTeams) * 100) : 0;

  // 健康等级的中文翻译
  const gradeMap: Record<string, string> = {
    Exceptional: 'Exceptional',
    Strong: 'Strong',
    Developing: 'Good',
    'Needs Attention': '需要关注',
  };
  const gradeChinese = gradeMap[healthGrade] || healthGrade;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* 平均分数 */}
      <StatCard
        title="Overall average score"
        value={averageScore.toFixed(1)}
        subtitle={`Healthy Level: ${gradeChinese}`}
        icon="📊"
        colorClass={getScoreColorClass(averageScore)}
        bgColorClass={getScoreBgColorClass(averageScore)}
      />

      {/* 最高分 */}
      <StatCard
        title="Highest score"
        value={highestScore.toFixed(1)}
        icon="🏆"
        colorClass="text-green-600"
        bgColorClass="bg-green-50"
      />

      {/* 最低分 */}
      <StatCard
        title="Lowest score"
        value={lowestScore.toFixed(1)}
        icon="📉"
        colorClass="text-yellow-600"
        bgColorClass="bg-yellow-50"
      />

      {/* 完成率 */}
      <StatCard
        title="Completion rate"
        value={`${completionRate}%`}
        subtitle={`${completedTeams} / ${totalTeams} Team`}
        icon="✅"
        colorClass="text-blue-600"
        bgColorClass="bg-blue-50"
      />
    </div>
  );
};

interface OrganizationStatsProps {
  totalOrganizations: number;
  totalAssessments: number;
  completedAssessments: number;
  activeOrganizations?: number;
}

/**
 * 组织管理统计卡片组
 */
export const OrganizationStats: React.FC<OrganizationStatsProps> = ({
  totalOrganizations,
  totalAssessments,
  completedAssessments,
  activeOrganizations,
}) => {
  const completionRate =
    totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Total organization count"
        value={totalOrganizations}
        subtitle={
          activeOrganizations !== undefined
            ? `${activeOrganizations} Active`
            : undefined
        }
        icon="🏢"
        colorClass="text-purple-600"
        bgColorClass="bg-purple-50"
      />

      <StatCard
        title="Total assessment count"
        value={totalAssessments}
        subtitle={`${completedAssessments} Completed`}
        icon="📋"
        colorClass="text-blue-600"
        bgColorClass="bg-blue-50"
      />

      <StatCard
        title="Total completed count"
        value={completedAssessments}
        icon="✅"
        colorClass="text-green-600"
        bgColorClass="bg-green-50"
      />

      <StatCard
        title="Completion rate"
        value={`${completionRate}%`}
        icon="📊"
        colorClass="text-indigo-600"
        bgColorClass="bg-indigo-50"
      />
    </div>
  );
};

export default SummaryStats;
