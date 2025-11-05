/**
 * 团队对比表格组件
 * 
 * 放置位置: frontend/src/components/TeamComparisonTable.tsx
 */

import React, { useState } from 'react';
import { TeamComparison } from '../types/organization';
import { getHealthGradeConfig } from '../types/organization';

interface TeamComparisonTableProps {
  teams: TeamComparison[];
  onTeamClick?: (assessmentId: string) => void;
}

type SortField = 'teamScore' | 'participationRate' | 'completedAt';
type SortOrder = 'asc' | 'desc';

/**
 * 团队对比表格
 */
export const TeamComparisonTable: React.FC<TeamComparisonTableProps> = ({
  teams,
  onTeamClick,
}) => {
  const [sortField, setSortField] = useState<SortField>('teamScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // 排序函数
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // 排序后的团队列表
  const sortedTeams = [...teams].sort((a, b) => {
    let aValue: number | string;
    let bValue: number | string;

    switch (sortField) {
      case 'teamScore':
        aValue = a.teamScore;
        bValue = b.teamScore;
        break;
      case 'participationRate':
        aValue = a.participationRate;
        bValue = b.participationRate;
        break;
      case 'completedAt':
        aValue = new Date(a.completedAt).getTime();
        bValue = new Date(b.completedAt).getTime();
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // 排序图标
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <span className="text-gray-400">⇅</span>;
    }
    return sortOrder === 'asc' ? (
      <span className="text-blue-600">↑</span>
    ) : (
      <span className="text-blue-600">↓</span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">🏆 团队表现排名</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                排名
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                团队名称
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('teamScore')}
              >
                <div className="flex items-center gap-2">
                  团队分数 <SortIcon field="teamScore" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                健康等级
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('participationRate')}
              >
                <div className="flex items-center gap-2">
                  参与率 <SortIcon field="participationRate" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                参与人数
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('completedAt')}
              >
                <div className="flex items-center gap-2">
                  完成时间 <SortIcon field="completedAt" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTeams.map((team, index) => {
              const gradeConfig = getHealthGradeConfig(team.teamScore);
              const formattedDate = new Date(team.completedAt).toLocaleDateString('zh-CN');

              return (
                <tr
                  key={team.assessmentId}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {/* 排名 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {index === 0 && (
                        <span className="text-2xl mr-2">🥇</span>
                      )}
                      {index === 1 && (
                        <span className="text-2xl mr-2">🥈</span>
                      )}
                      {index === 2 && (
                        <span className="text-2xl mr-2">🥉</span>
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        #{index + 1}
                      </span>
                    </div>
                  </td>

                  {/* 团队名称 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {team.teamName}
                    </div>
                  </td>

                  {/* 团队分数 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-2xl font-bold ${gradeConfig.color}`}>
                      {team.teamScore.toFixed(1)}
                    </div>
                  </td>

                  {/* 健康等级 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${gradeConfig.bgColor} ${gradeConfig.color}`}
                    >
                      {gradeConfig.label}
                    </span>
                  </td>

                  {/* 参与率 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-gray-900">
                        {(team.participationRate * 100).toFixed(0)}%
                      </div>
                      <div className="ml-2 w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            team.participationRate >= 0.9
                              ? 'bg-green-500'
                              : team.participationRate >= 0.75
                              ? 'bg-blue-500'
                              : 'bg-yellow-500'
                          }`}
                          style={{ width: `${team.participationRate * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* 参与人数 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {team.participationCount} / {team.totalMembers}
                    </div>
                  </td>

                  {/* 完成时间 */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{formattedDate}</div>
                  </td>

                  {/* 操作 */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onTeamClick?.(team.assessmentId)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      查看详情
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 空状态 */}
      {teams.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无团队数据</p>
        </div>
      )}
    </div>
  );
};

export default TeamComparisonTable;
