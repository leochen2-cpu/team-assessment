/**
 * 洞察面板组件
 * 
 * 放置位置: frontend/src/components/InsightsPanel.tsx
 */

import React from 'react';
import { Insights } from '../types/organization';

interface InsightsPanelProps {
  insights: Insights;
}

/**
 * 洞察面板
 */
export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  return (
    <div className="space-y-6">
      {/* 总体概述 */}
      {insights.summary && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <span className="text-3xl">💡</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                总体概述
              </h3>
              <p className="text-gray-700 leading-relaxed">{insights.summary}</p>
            </div>
          </div>
        </div>
      )}

      {/* 两列布局：优势和关注点 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 优势 */}
        {insights.strengths.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💪</span>
              <h3 className="text-lg font-semibold text-gray-900">组织优势</h3>
            </div>
            <ul className="space-y-3">
              {insights.strengths.map((strength, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-700 bg-green-50 rounded-lg p-3 border border-green-200"
                >
                  <span className="text-green-600 font-bold flex-shrink-0">
                    ✓
                  </span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 关注点 */}
        {insights.concerns.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎯</span>
              <h3 className="text-lg font-semibold text-gray-900">关注领域</h3>
            </div>
            <ul className="space-y-3">
              {insights.concerns.map((concern, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-700 bg-yellow-50 rounded-lg p-3 border border-yellow-200"
                >
                  <span className="text-yellow-600 font-bold flex-shrink-0">
                    →
                  </span>
                  <span>{concern}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 最佳表现团队 */}
      {insights.topPerformer && (
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-6 border border-yellow-200">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🏆</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                最佳表现团队
              </h3>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-xl font-bold text-gray-900">
                  {insights.topPerformer.teamName}
                </span>
                <span className="text-2xl font-bold text-yellow-600">
                  {insights.topPerformer.score.toFixed(1)} 分
                </span>
              </div>
              {insights.topPerformer.standoutDimensions &&
                insights.topPerformer.standoutDimensions.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm text-gray-600">突出维度:</span>
                    {insights.topPerformer.standoutDimensions.map((dim, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800"
                      >
                        {dim}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* 需要关注的团队 */}
      {insights.needsAttention.length > 0 && (
        <div className="bg-white rounded-lg border border-red-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-lg font-semibold text-gray-900">需要关注的团队</h3>
          </div>
          <div className="space-y-4">
            {insights.needsAttention.map((team, index) => (
              <div
                key={index}
                className="bg-red-50 rounded-lg p-4 border border-red-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">
                    {team.teamName}
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    {team.score.toFixed(1)} 分
                  </span>
                </div>
                {team.issues.length > 0 && (
                  <ul className="space-y-1">
                    {team.issues.map((issue, issueIndex) => (
                      <li
                        key={issueIndex}
                        className="text-sm text-gray-700 flex items-start gap-2"
                      >
                        <span className="text-red-500 flex-shrink-0">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 改进建议 */}
      {insights.recommendations.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📋</span>
            <h3 className="text-lg font-semibold text-gray-900">改进建议</h3>
          </div>
          <ol className="space-y-3">
            {insights.recommendations.map((recommendation, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-gray-700 bg-blue-50 rounded-lg p-3 border border-blue-200"
              >
                <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                  {index + 1}
                </span>
                <span className="flex-1">{recommendation}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 跨团队趋势 */}
      {insights.crossTeamTrends && insights.crossTeamTrends.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📊</span>
            <h3 className="text-lg font-semibold text-gray-900">跨团队趋势</h3>
          </div>
          <ul className="space-y-2">
            {insights.crossTeamTrends.map((trend, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-gray-700 bg-gray-50 rounded-lg p-3"
              >
                <span className="text-indigo-600 flex-shrink-0">▸</span>
                <span>{trend}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;
